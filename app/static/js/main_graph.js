var base_url = `http://${document.domain}:${location.port}`;

let color_neut_line = '#aaa'

// let color_neg = '#f03333',
//     color_neut = '#666',
//     color_pos = '#7a99c5';

// Default Settings //
// Objects
var link_limit = 2500;
var node_limit = 2000;

// Styling
var default_node_color = "rgb(172, 220, 114)";
var highlight_node_color_primary = 'red';
var highlight_node_color_secondary = '#7a99c5';

var default_circle_min_radius = 2;
var default_circle_max_radius = 10;

var default_node_opacity = 0.8;

const line_width_max = 2,
    line_width_min = 0.05;

const min_line_opac = 0.1,
    max_line_opac = 0.7;


// Sentiment Colors
// Interpolate red and blue

var link_highlight_type = 'both'
// End Settings //

// Set functions //



var clicked_node = null;
var node_labels = false;

// State-Variable
var link_sent_state = "both"


// Link State to Color Map
getLinkColor = { '1': color_pos, 'both': color_neut_line, '-1': color_neg }


// Margins
var margin = { top: 0, right: 0, bottom: 0, left: 0 },
    width = $("#svg-div").parent().width() - margin.left - margin.right,
    height = $("#svg-div").parent().height() - margin.top - margin.bottom;

// Scaling
var xScale = null;
var yScale = null;
var nodeScale = d3.scaleSqrt().range([default_circle_min_radius, default_circle_max_radius]);
var lineScale = d3.scalePow().range([line_width_min, line_width_max]);
var opacScale = d3.scaleLog().range([min_line_opac, max_line_opac]);

var svg = d3.select('#svg-div')
    .append('svg')
    .attr('viewbox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMinYMin slice')
    // .attr('preserveAspectRatio', 'xMinYMin meet')
    .classed('svg-content', true)
    .append('g')
    .attr('id', 'main-graph')

var background_area = svg
    .insert("g", ":first-child")
    .append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('opacity', 0)

background_area.on('click', () => {
    clicked_node = null;
    nodeOutFunction();
})

// Pan and Zoom
var transform = d3.zoomIdentity.translate(100, 50).scale(0.8)
var zoom = d3.zoom()
    .scaleExtent([0.2, 10])
    .on("zoom",  function () {
        svg
            .attr('transform', d3.event.transform)
            
    //     // nameFunction()
    //     // console.log("insidezoom")
    //     // console.log(d3.zoomIdentity.scale(this));
    //     // console.log(d3.zoomTransform(element).k)
    //     console.log(zoom)


    });

// function nameFunction() {
//     d3.selectAll('.node')
//     .enter()
//     .append("text")
//     .attr("x", (d) => xScale(d.x))
//     .attr("y", (d) => yScale(d.y))
//         }
d3.select('#svg-div').call(zoom)

// Force Graph
var simulation = null;

// var simulation = d3.forceSimulation()
//     // .force("charge", d3.forceManyBody().strength(-30000))
//     .force("link", d3.forceLink().id(function (d) { return d.sub; }).distance(40))
//     // .force("x", d3.forceX(width / 2))
//     // .force("y", d3.forceY(height / 2))
//     .force('collision', d3.forceCollide().radius(4))
//     .on("tick", ticked);

var link_layer = svg
    .append('g')
    .attr('class', 'layer')
    .attr('id', 'link-layer');

var node_layer = svg
    .append('g')
    .attr('class', 'layer')
    .attr('id', 'node-layer');

var text_layer = svg
    .append('g')
    .attr('class', 'layer')
    .attr('id', 'text-layer');

var highlight_layer = svg
    .append('g')
    .attr('class', 'layer')
    .attr('id', 'highlight-layer');

var subview_layer = svg
    .append('g')
    .attr('class', 'layer')
    .attr('id', 'subview-layer');


var adjlist = [];
var link_master = null;
var node_master = null;
var link_work = null;
var node_work = null;
var nodeById = d3.map();


var t0 = null,
    t1 = null,
    t2 = null,
    t3 = null;

// Load and Draw Data
function loadAndDraw(nodeURL, linkURL) {

    d3.csv(nodeURL).then(function (data_node) {
        d3.csv(linkURL).then(function (data_link) {
            let index = 0;
            link_master = data_link // Limit number of links
            node_master = data_node;

            // Calculate relevant node information
            node_master.forEach(function (node) {
                node.in_pos = 0;
                node.out_pos = 0;
                node.in_neg = 0;
                node.out_neg = 0;
                node.adj_src = [];
                node.adj_trgt = [];
                node.index = index;
                index++;
                Object.defineProperty(node, 'total_in', {
                    get: function () { return this.in_pos + this.in_neg }
                });
                Object.defineProperty(node, 'total_out', {
                    get: function () { return this.out_pos + this.out_neg }
                })
                nodeById.set(node.sub, node);
            });

            // Build node-link relationships
            link_master.forEach(function (link) {
                link.source = nodeById.get(link.source);
                link.target = nodeById.get(link.target);
                link.n = Number(link.n)

                if (link.sentiment == "1") {
                    link.source.out_pos += link.n
                } else {
                    link.source.out_neg += link.n
                }
                node = nodeById.get(link.target);
                if (link.sentiment == "1") {
                    link.target.in_pos += link.n
                } else {
                    link.target.in_neg += link.n
                }
                link.source.adj_src.push(link);
                link.target.adj_trgt.push(link);
            });
            node_work = node_master
            link_work = link_master.slice(0, link_limit)

            // Set Domain Scales
            xScale = d3.scaleLinear()
                .domain(d3.extent(node_work, (d) => Number(d.x)))
                .range([0, width])

            yScale = d3.scaleLinear()
                .domain(d3.extent(node_work, (d) => Number(d.y)))
                .range([0, height])

            nodeScale.domain(d3.extent(node_master, (d) => Number(d.total_out)))
            lineScale.domain(d3.extent(link_master, (d) => Number(d.n)))
            opacScale.domain(d3.extent(link_master, (d) => Number(d.n)))

            // Draw Nodes
            nodes = node_layer.selectAll('.node')
                .data(node_work)
                .enter()
                .append("circle")
                .attr("cx", (d) => xScale(d.x))
                .attr("cy", (d) => yScale(d.y))
                .attr("class", "node")
                .attr("r", 0)
                .style("fill", default_node_color)
                .style("opacity", default_node_opacity)
                .on('mouseover', nodeOverFunction)
                .on('mousemove', () => tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px"))
                .on('mouseout', nodeOutFunction)
                .on('click', function (d) { // Select Behaviour
                    if (clicked_node == null) {
                        clicked_node = this;
                    } else {
                        clearHighlights()
                        clicked_node = this;
                        setHighlights(d, this)
                    }
                })
                .sort(function (a, b) { // Draw smaller nodes above
                    return b.total_out - a.total_out
                })

            // Animate Nodes
            nodes.transition()
                .duration(300)
                .delay((d, i) => (i % 10) * 100)
                .attr("r", (d) => nodeScale(d.total_out));

            // simulation = d3.forceSimulation(nodes)
            //     .velocityDecay(0.2)
            //     .force('charge', d3.forceManyBody().strength(5))
            //     .force('center', d3.forceCenter(width / 2, height / 2))
            //     .force('collision', d3.forceCollide().radius(function (d) {
            //         return nodeScale(d.total_out)
            //     }))
            //     .on('tick', ticked);

            // console.log('This is animating')
            // nodes.transition()
            //     .duration(200)
            //     .delay((d, i) => (i % 10) * 100)
            //     .attr('opacity', 0.8)
            //     .attr('r', default_circle_min_radius)

            // Draw Links
            links = link_layer.selectAll('.link')
                .data(link_work, keyLinks)
                .enter()
                .append("line")
                .attr('class', 'link')
                .style("stroke", "#aaa")
                .style("stroke-width", (d) => lineScale(d.n))
                .style('opacity', 1)
                .style('visibility', 'hidden')
                // .style('stroke-dasharray', "4")
                // .style('stroke-dasharray', (d) => (d.sentiment == "1" ? null : null))
                .attr("x1", (d) => xScale(d.source.x))
                .attr("y1", (d) => yScale(d.source.y))
                .attr("x2", (d) => xScale(d.target.x))
                .attr("y2", (d) => yScale(d.target.y));

            // Animate Links
            links
                .transition()
                .delay((d, i) => (i % 10) * 100 + 1000)
                .duration(0)
                .style('visibility', 'visible');


            
            // links.attr("d", function (d) {
            //     var dx = xScale(d.target.x) - xScale(d.source.x),
            //         dy = yScale(d.target.y) - yScale(d.source.y),
            //         dr = Math.sqrt(dx * dx + dy * dy);
            //     return "M" + xScale(d.source.x) + "," + yScale(d.source.y) + "A" + dr + "," + dr + " 0 0,1 "
            //         + xScale(d.target.x) + "," + yScale(d.target.y);
            // });

            // Do we want to highlight nodes with low value connections?
            setAdj(link_work);
            // link_work.forEach(function (d) {
            //     adjlist[d.source.index + "-" + d.target.index] = true;
            //     adjlist[d.target.index + "-" + d.source.index] = true;
            // });


            // d3.select('#svg-div').attr('transform', transform);
            // svg.attr('transform', transform);
            // d3.zoomIdentity = transform;
        });
    })

}
function setAdj(link_ary) {
    adjlist = []
    link_ary.forEach(function (d) {
        adjlist[d.source.index + "-" + d.target.index] = true;
        adjlist[d.target.index + "-" + d.source.index] = true;
    });
}

// Initialize graph
loadAndDraw('/nodes', '/links');


function keyLinks(d) {
    return `${d.source.sub}-${d.target.sub}`
}

function filterNodes() {

}

function filterLinks() {

}

// Force Behaviour (Not Implemented)
function ticked() {
    nodes.attr('cx', function (d) {
        return xScale(d.x)
    })
        .attr('cy', function (d) {
            return yScale(d.y)
        })
    // link.attr("x1", function (d) { return d.source.x; })
    //     .attr("y1", function (d) { return d.source.y; })
    //     .attr("x2", function (d) { return d.target.x; })
    //     .attr("y2", function (d) { return d.target.y; });


    // node.attr("cx", function (d) { return d.x; })
    //     .attr("cy", function (d) { return d.y; });
}

// Hover Functionalities
function nodeOverFunction(d) {
    tooltip.style("visibility", "visible")
        .html(() => {
            const content = `<strong>Subreddit:</strong> <span>${d.sub}</span>`
            return content;
        })

    if (clicked_node == null) {
        setHighlights(d, this)
    }

    selected_node = this.cloneNode()
    d3.select(selected_node)
        .attr('id', 'current-node')
        .style('fill', highlight_node_color_primary)
    highlight_layer.node().appendChild(selected_node)
};

function nodeOutFunction() {
    tooltip.style("visibility", "hidden")
    // tooltip_info
    if (clicked_node == null) {
        clearHighlights();
    }
    highlight_layer.select('#current-node').remove()
}


// Highlighting Functionality
function setHighlights(d, e) {
    var index = d3.select(e).datum().index;

    // Filter Existing Nodes
    highlight_links = links
        .filter(function (d) {
            return d.source.index == index || d.target.index == index;
        }).nodes();

    highlight_nodes = nodes
        .filter((d) => neigh(index, d.index))
        .nodes();

    // Insert Elements into Highlight Layer
    highlight_links.forEach(function (d) {
        highlight_layer.node().appendChild(d.cloneNode())
    })

    highlight_nodes.forEach(function (d) {
        highlight_layer.node().appendChild(d.cloneNode())
    })

    highlight_layer.selectAll('.node')
        .style('fill', highlight_node_color_primary)


    // highlight_layer.selectAll('.link').data(link_work, keyLinks).style('stroke-width', (d) => lineScale(d.n) + 1)

    link_layer.style('opacity', 0.1)
    node_layer.style('opacity', 0.5)
}

function clearHighlights() {
    $('#highlight-layer').empty();
    node_layer.style('opacity', 1);
    link_layer.style('opacity', 1);
}

tooltip = d3.select(".wrapper").append("div")
    .attr("class", "svg-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .text("");

// Determine if two nodes are neighbors
function neigh(a, b) {
    return a == b || adjlist[a + "-" + b];
}


// Drag Behaviour (Not Necessary Currently)
// drag = simulation => {

//     function dragstarted(d) {
//         if (!d3.event.active) simulation.alphaTarget(0.3).restart();
//         d.fx = d.x;
//         d.fy = d.y;
//     }

//     function dragged(d) {
//         d.fx = d3.event.x;
//         d.fy = d3.event.y;
//     }

//     function dragended(d) {
//         if (!d3.event.active) simulation.alphaTarget(0);
//         d.fx = null;
//         d.fy = null;
//     }

//     return d3.drag()
//         .on("start", dragstarted)
//         .on("drag", dragged)
//         .on("end", dragended);
// }


// Update Graph Elements -> Needs to be implemented
function updateLinks(link_data) {

}

function updateNodes(s, nodeURL) {


}


function updateGraph(node_data, link_data, sent) {
    // Need to update the data bound to nodes

    // Node Update



    // Link Update
    links = link_layer
        .selectAll('.link')
        .data(link_data, keyLinks) // Bind new data

    links.exit() // Remove old data
        .transition('remove')
        .duration(0)
        .delay((d, i) => (i % 10) * 50)
        .remove()


    // Rework This Animation
    links.transition('update')
        .delay(500)
        .duration(510)
        .style("stroke-width", (d) => lineScale(d.n))
        .style('stroke', function () {
            return getLinkColor[link_sent_state]
        })

    links
        .enter() // Append new lines
        .append("line")
        .attr('class', 'link')
        .style("stroke", "#aaa")
        .style('visibility', 'hidden')
        .style("stroke-width", (d) => lineScale(d.n))
        .attr("x1", (d) => xScale(d.source.x))
        .attr("y1", (d) => yScale(d.source.y))
        .attr("x2", (d) => xScale(d.target.x))
        .attr("y2", (d) => yScale(d.target.y))
        .merge(links) // Merge with existing lines and update data
        .transition('draw')
        .delay((d, i) => (i % 10) * 50 + 500)
        .duration(200)
        .style('stroke', function () {
            return getLinkColor[link_sent_state]
        })
        .style('visibility', 'visible')

    // links
    //     .transition()
    //     .delay((d, i) => (i % 10) * 100 + 1000)
    //     .duration(0)
    //     .style('visibility', 'visible');

    // links
    //     .transition()
    //     .delay((d, i) => (i % 10) * 100 + 1000)
    //     .duration(200)
    //     .style("stroke-width", (d) => lineScale(d.n))


}

// test_links = link_master.filter(function (d) {
//     return d.source.sub == 'iama'
// })
// filters = [{'sentiment': "1"}]


// May be adjusted to new filter workflow
function updateSentiment(s) {
    if (s == "pos") {
        link_current = link_master.filter(function (d) {
            return d.sentiment == "1"
        })
    } else if (s == "neg") {
        link_current = link_master.filter(function (d) {
            return d.sentiment == "-1"
        })
    } else {
        link_current = link_master;
    }
    console.log('Done filtering')

    link_current = link_current.sort(function (a, b) {
        return b.n - a.n
    })
    console.log('updating graph')
    link_current_trunc = link_current.slice(0, link_limit)
    setAdj(link_current_trunc)

    value_map = { 'pos': "1", 'both': "both", 'neg': '-1' }
    link_sent_state = value_map[s]
    updateGraph(null, link_current_trunc)

    // nodeURL = "/sentiment_nodes?s=" + s
    // linkURL = "/sentiment_links?s=" + s

    // d3.selectAll('#link-layer').remove();
    // d3.selectAll('.node').remove();

    // loadAndDraw(nodeURL, linkURL)

    // link_layer = svg
    //     .append('g')
    //     .attr('class', 'layer')
    //     .attr('id', 'link-layer');

    // node_layer = svg
    //     .append('g')
    //     .attr('class', 'layer')
    //     .attr('id', 'node-layer');

}


function drawLinkedTooltips() {

}

// Change primary and secondary colors

// Performance testing
function test_performance() {
    let t0 = null;
    let t1 = null;
    let t2 = null;
    let t3 = null
    t0 = performance.now()
    nodeURL = "/sentiment_nodes?s=" + "pos"
    linkURL = "/sentiment_links?s=" + "pos"
    d3.csv(nodeURL).then(function (data_node) {
        d3.csv(linkURL).then(function (data_link) {
            t1 = performance.now()
            t2 = performance.now()
            link_master.filter(function (d) {
                return d.sentiment = "1"
            })
            t3 = performance.now()
            console.log([t3 - t2, t1 - t0])
        })
    })
}



// function nameFunction() {
//     text = text_layer.selectAll("text")
//         .data(node_work)
//         .enter()
//         .append("text")
//         .text(function (d) {
//             console.log(d.sub);
//             return d.sub;

//         })
//         .attr("dx", (d) => xScale(d.x))
//         .attr("dy", (d) => yScale(d.y))
//         .style("font-family", "Arial")
//         .style("font-size", 4);
// }
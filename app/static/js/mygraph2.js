var base_url = `http://${document.domain}:${location.port}`;

// Default Settings //
// Objects
var link_limit = 2000;
var node_limit = 2000;

// Styling
var default_node_color = "rgb(172, 220, 114)";
var highlight_node_color_primary = 'red';

var default_circle_min_radius = 2;
var default_circle_max_radius = 10;

var default_node_opacity = 0.8;

const line_width_max = 2,
    line_width_min = 0.4;

const min_line_opac = 0.1,
    max_line_opac = 0.7;


// Sentiment Colors
// Interpolate red and blue

var link_highlight_type = 'both'
// End Settings //

// Set functions //





click_state = false;

// Margins
var margin = { top: 0, right: 0, bottom: 0, left: 0 },
    width = $("#svg-div").parent().width() - margin.left - margin.right,
    height = $("#svg-div").parent().height() - margin.top - margin.bottom;

// Scaling
var xScale = null;
var yScale = null;
var nodeScale = d3.scaleSqrt().range([default_circle_min_radius, default_circle_max_radius]);
var lineScale = d3.scaleLog().range([line_width_min, line_width_max]);
var opacScale = d3.scaleLog().range([min_line_opac, max_line_opac]);

var svg = d3.select('#svg-div')
    .append('svg')
    .attr('viewbox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMinYMin slice')
    // .attr('preserveAspectRatio', 'xMinYMin meet')
    .classed('svg-content', true)
    .append('g')
    .attr('id', 'main-graph')

var layers = svg.selectAll('g')

// Pan and Zoom
var transform = d3.zoomIdentity.translate(100, 50).scale(0.8)
var zoom = d3.zoom()
    .scaleExtent([0.2, 10])
    .on("zoom", function () {
        svg
            .attr('transform', d3.event.transform)
    });
d3.select('#svg-div').call(zoom);

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

var highlight_layer = svg
    .append('g')
    .attr('class', 'layer')
    .attr('id', 'highlight-layer');


var adjlist = [];

let link_data = null;
let node_data = null;
var nodeById = d3.map();

// Load and Draw Data
d3.csv("/nodes").then(function (data_node) {
    d3.csv('/links').then(function (data_link) {
        let index = 0;
        link_data = data_link.slice(0, link_limit);
        node_data = data_node;

        node_data.forEach(function (node) {
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
        link_data.forEach(function (link) {
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


        // Set Domain Scales
        xScale = d3.scaleLinear()
            .domain(d3.extent(node_data, (d) => Number(d.x)))
            .range([0, width])

        yScale = d3.scaleLinear()
            .domain(d3.extent(node_data, (d) => Number(d.y)))
            .range([0, height])

        nodeScale.domain(d3.extent(node_data, (d) => Number(d.total_out)))
        lineScale.domain(d3.extent(link_data, (d) => Number(d.n)))
        opacScale.domain(d3.extent(link_data, (d) => Number(d.n)))

        nodes = node_layer.selectAll('.node')
            .data(node_data)
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
            .on('mouseout', nodeOutFunction);

        nodes.transition()
            .duration(300)
            .delay((d, i) => (i % 10) * 100)
            // .attr("opacity", 0.8)
            // .attr('r', )
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

        links = link_layer.selectAll('.link')
            .data(link_data)
            .enter()
            .append("line")
            .style("stroke", "#aaa")
            // .attr("stroke-width", (d) => lineScale(d.n))
            .style("stroke-width", 0.4)
            .style('opacity', 1)
            .style('visibility', 'hidden')
            // .style('stroke-dasharray', (d) => (d.sentiment == "1" ? null : null))
            .attr("x1", (d) => xScale(d.source.x))
            .attr("y1", (d) => yScale(d.source.y))
            .attr("x2", (d) => xScale(d.target.x))
            .attr("y2", (d) => yScale(d.target.y));

        links
            .transition()
            .delay((d, i) => (i % 10) * 100 + 1000)
            .duration(0)
            .style('visibility', 'visible');
        // .attr('display', 'none');

        // links.attr("d", function (d) {
        //     var dx = xScale(d.target.x) - xScale(d.source.x),
        //         dy = yScale(d.target.y) - yScale(d.source.y),
        //         dr = Math.sqrt(dx * dx + dy * dy);
        //     return "M" + xScale(d.source.x) + "," + yScale(d.source.y) + "A" + dr + "," + dr + " 0 0,1 "
        //         + xScale(d.target.x) + "," + yScale(d.target.y);
        // });

        // links.style('fill', 'none')
        // .style('stroke', '#aaa')
        // .style("stroke-width", 0.5);

        link_data.forEach(function (d) {
            adjlist[d.source.index + "-" + d.target.index] = true;
            adjlist[d.target.index + "-" + d.source.index] = true;
        });

        d3.select('#svg-div').attr('transform', transform);
        svg.attr('transform', transform);
        // d3.zoomIdentity = transform;
    });
})

function filterNodes() {

}

function filterLinks() {

}

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


function nodeOverFunction(d) {
    tooltip.style("visibility", "visible")
        .html(() => {
            const content = `<strong>Subreddit:</strong> <span>${d.sub}</span>`
            return content;
        })

    // highlight_node = d3.select(this);
    // .style('opacity', 1)
    // .style('fill', 'red')

    var index = d3.select(d3.event.target).datum().index;
    // nodes.style("fill", function (o) {
    //     return neigh(index, o.index) ? highlight_node_color_primary : default_node_color;
    // });
    // links.filter(function (d){
    //     return d.source.index == index || d.target.index == index;
    // })
    
    // Filter
    highlight_links = links.filter(function (d) {
        return d.source.index == index || d.target.index == index;
    }).nodes();
    highlight_nodes = nodes.filter((d) => neigh(index, d.index)).nodes();

    // Add
    highlight_links.forEach(function(d){
        highlight_layer.node().appendChild(d.cloneNode())
    })

    selected_node = this.cloneNode()
    highlight_layer.node().appendChild(selected_node)
    highlight_nodes.forEach(function(d){
        highlight_layer.node().appendChild(d.cloneNode())
    })
    highlight_layer.selectAll('.node').style('fill', 'red')
    d3.select(selected_node)
    .on('mouseout', nodeOutFunction)
    .on('mouseover', nodeOverFunction)

    // console.log(d3.select(this).datum());
    // let data = d3.select(this).datum().adj_src;
    // highlight_links = highlight_layer
    //     .data(data)
    //     .enter()
    //     .append('line')
    //     .style("stroke", "#aaa")
    //     .style("stroke-width", 0.4)
    //     .style('opacity', 1)
    //     .attr("x1", (d) => xScale(d.source.x))
    //     .attr("y1", (d) => yScale(d.source.y))
    //     .attr("x2", (d) => xScale(d.target.x))
    //     .attr("y2", (d) => yScale(d.target.y));
    link_layer.style('opacity', 0.1)
    node_layer.style('opacity', 0.5)
};
test_links = null;
// function adjacency

function nodeOutFunction() {
    $('#highlight-layer').empty();
    // highlight_layer.empty();
    // d3.select(this)
    //     .transition()
    //     .duration(100)
    //     .style('opacity', 0.8)
    //     .attr("r", function (d) {
    //         d.weight = link.filter(function (l) {
    //             return l.source.index == d.index || l.target.index == d.index
    //         }).size();
    //         var minRadius = 5;
    //         return minRadius + (d.weight / 10);
    //     })
    tooltip.style("visibility", "hidden")

    nodes
        .style("opacity", default_node_opacity)
        .style("fill", default_node_color)
    node_layer.style('opacity', 1)
    link_layer.style('opacity', 1);
}

tooltip = d3.select("body").append("div")
    .attr("class", "svg-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .text("");


function neigh(a, b) {
    return a == b || adjlist[a + "-" + b];
}

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

function updateLinks() {
    console.log("Updating links")
};


function updateNodes(data) {
    console.log('Updating Nodes')
    nodes = d3.selectAll('.nodes')
    nodes.data(data, (d) => d.sub)
}


// Animate Nodes
// Animate Links


function drawLinkedTooltips(){

}
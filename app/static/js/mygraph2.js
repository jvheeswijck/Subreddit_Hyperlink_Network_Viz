var base_url = `http://${document.domain}:${location.port}`;

// Default Settings
var default_node_color = "rgb(172, 220, 114)";
var highlight_node_color_primary = 'red';
var default_circle_min_radius = 4;
var default_circle_max_radius = 12;
var default_node_opacity = 0.8;
var line_width_max = 8;
var line_width_min = 0.5;
var link_limit = 2000;
var node_limit = 2000;
var min_line_opac = 0.1;
var max_line_opac = 0.7;

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
// var simulation = d3.forceSimulation()
//     // .force("charge", d3.forceManyBody().strength(-30000))
//     .force("link", d3.forceLink().id(function (d) { return d.sub; }).distance(40))
//     // .force("x", d3.forceX(width / 2))
//     // .force("y", d3.forceY(height / 2))
//     .force('collision', d3.forceCollide().radius(4))
//     .on("tick", ticked);

var links = svg
    .append('g')
    .attr('id', 'links')
    .selectAll(".link");

var nodes = svg
    .append('g')
    .attr('id', 'nodes')
    .selectAll(".node");

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
            node.index = index;
            index++;
            Object.defineProperty(node, 'total_in', {
                get: function() { return this.in_pos +  this.in_neg}
              });
            Object.defineProperty(node, 'total_out', {
                get: function () { return this.out_pos + this.out_neg}
            })
            nodeById.set(node.sub, node);
        });
        link_data.forEach(function (link) {
            link.source = nodeById.get(link.source);
            link.target = nodeById.get(link.target);
            link.n = Number(link.n)

            if (link.sentiment == "1"){
                link.source.out_pos += link.n
            } else {
                link.source.out_neg += link.n
            }
            node = nodeById.get(link.target);
            if (link.sentiment == "1"){
                link.target.in_pos += link.n
            } else {
                link.target.in_neg += link.n
            }
        });

        // Calculate Node Stats and Active Nodes

        xScale = d3.scaleLinear()
            .domain(d3.extent(node_data, (d) => Number(d.x)))
            .range([0, width])

        yScale = d3.scaleLinear()
            .domain(d3.extent(node_data, (d) => Number(d.y)))
            .range([0, height])

        nodeScale.domain(d3.extent(node_data, (d) => Number(d.total_out)))
        lineScale.domain(d3.extent(link_data, (d) => Number(d.n)))
        opacScale.domain(d3.extent(link_data, (d) => Number(d.n)))

        nodes = nodes
            .data(node_data)
            .enter()
            .append("circle")
            .attr("cx", (d) => xScale(d.x))
            .attr("cy", (d) => yScale(d.y))
            .attr("class", "node")
            .style("r", (d) => nodeScale(d.total_out))
            .style("fill", default_node_color)
            .style("opacity", default_node_opacity)
            // .attr('display', 'none')
            .on('mouseover', nodeOverFunction)
            .on('mousemove', () => tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px"))
            .on('mouseout', nodeOutFunction);

        // console.log('This is animating')
        // nodes.transition()
        //     .duration(200)
        //     .delay((d, i) => (i % 10) * 100)
        //     .attr('opacity', 0.8)
        //     .attr('r', default_circle_min_radius)

        links = links
            .data(link_data)
            .enter()
            .append("line")
            .style("stroke", "#aaa")
            // .attr("stroke-width", (d) => lineScale(d.n))
            .style("stroke-width", 1)
            .style('opacity', 1)
            .style('stroke-dasharray', (d) => (d.sentiment == "1" ? null : null))
            .attr("x1", (d) => xScale(d.source.x))
            .attr("y1", (d) => yScale(d.source.y))
            .attr("x2", (d) => xScale(d.target.x))
            .attr("y2", (d) => yScale(d.target.y));
        // .attr('display', 'none');

        link_data.forEach(function (d) {
            adjlist[d.source.index + "-" + d.target.index] = true;
            adjlist[d.target.index + "-" + d.source.index] = true;
        });

        d3.select('#svg-div').attr('transform', transform);
        // d3.zoomIdentity = transform;
    });
})

function filterNodes() {

}

function filterLinks() {

}

function ticked() {
    simulation.stop();
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

    d3.select(this)
        .style('opacity', 1)
        .style('fill', 'red')

    var index = d3.select(d3.event.target).datum().index;
    nodes.style("fill", function (o) {
        return neigh(index, o.index) ? highlight_node_color_primary : default_node_color;
    });
    links.style("opacity", function (o) {
        return o.source.index == index || o.target.index == index ? 1 : 0.1;
    });

};

function nodeOutFunction() {
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
    links.style('opacity', (d) => 1);
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

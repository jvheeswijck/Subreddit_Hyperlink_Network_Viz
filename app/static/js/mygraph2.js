var base_url = `http://${document.domain}:${location.port}`;

var margin = { top: 0, right: 0, bottom: 0, left: 0 },
    width = $("#svg-div").parent().width() - margin.left - margin.right,
    height = $("#svg-div").parent().height() - margin.top - margin.bottom;


var nodeScale = d3.scaleSqrt();


var svg = d3.select('#svg-div')
    .append('svg')
    .attr('viewbox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .classed('svg-content', true);

//  FIGURE OUT THIS VIEWBOX STUFF

var zoom = d3.zoom()
    .scaleExtent([0.2, 10])
    .duration(500)
    .on("zoom", function () {
        svg.selectAll('circle')
            .attr('transform', d3.event.transform);
        tooltip.attr('transform', d3.event.transform);
        svg.selectAll('line')
            .attr('transform', d3.event.transform);
        tooltip.attr('transform', d3.event.transform);
        // style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
    });



svg.call(zoom);


var xScale = null;
var yScale = null;


// var svg = d3.select('#svg-div')
//     .append('svg').attr("width", width)
//     .attr("height", height)

var simulation = d3.forceSimulation()
    .force("charge", d3.forceManyBody().strength(-200))
    .force("link", d3.forceLink().id(function (d) { return d.sub; }).distance(40))
    .force("x", d3.forceX(width / 2))
    .force("y", d3.forceY(height / 2))
    .on("tick", ticked);

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");


// jsonfile = d3.json(`https://raw.githubusercontent.com/Pratikeshsingh/DSP/master/sourcetargetsubset.json`).then(function (data) {
// jsonfile = d3.json(`https://raw.githubusercontent.com/Pratikeshsingh/DSP/master/sourcetarget.json`).then(function (data) {
jsonfile = d3.json("/jsondata").then(function (data) {

    
    console.log(data)

    xScale = d3.scaleLinear()
        .domain(d3.extent(data.nodes, (d) => d.x))
        .range([0, width])


    yScale = d3.scaleLinear()
        .domain(d3.extent(data.nodes, (d) => d.y))
        .range([0, height])

    simulation.nodes(data.nodes);
    simulation.force("link").links(data.links);

    node = node
        .data(data.nodes)
        .enter().append("circle")
        .attr("cx", function (d) { return xScale(d.x); })
        .attr("cy", function (d) { return yScale(d.y); })
        .attr("class", "node")
        .attr("r", 6)
        .style("fill", "rgb(172, 220, 114)")
        .style("opacity", 0.8)
        .on('mouseover', nodeOverFunction)
        .on('mousemove', () => tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px"))
        .on('mouseout', nodedOutFunction)

    // .style("fill", function (d) { return d.id; });

    console.log(node)
    link = svg
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("stroke", "#aaa")
        .attr("stroke-width", "1px");

});

function ticked() {
    link.attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });

    node.attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; });
}


function nodeOverFunction(d) {
    tooltip.style("visibility", "visible")
        .html(() => {
            const content = `<strong>Subreddit:</strong> <span>${d.sub}</span>`
            return content;
        })
    d3.select(this)
        .style('opacity', 1)
        .transition()
        .duration(100)
        .attr('r', '12px')

};

function nodedOutFunction() {
    d3.select(this)
        .transition()
        .duration(100)
        .style('opacity', 0.8)
        .attr('r', '8px')
    tooltip.style("visibility", "hidden")
}

tooltip = d3.select("body").append("div")
    .attr("class", "svg-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .text("");

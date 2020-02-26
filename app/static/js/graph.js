var base_url = `http://${document.domain}:${location.port}`;

var margin = { top: 0, right: 0, bottom: 0, left: 0 },
    width = $("#svg-div").parent().width() - margin.left - margin.right,
    height = $("#svg-div").parent().height() - margin.top - margin.bottom;

// var min_zoom = 0.1;
// var max_zoom = 7;
// var zoom = d3.zoom().scaleExtent([min_zoom,max_zoom])

var nodeScale = d3.scaleSqrt();


var svg = d3.select('#svg-div')
    .append('svg')
    .attr('viewbox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .classed('svg-content', true);

//  FIGURE OUT THIS VIEWBOX STUFF


var zoom = d3.zoom()
    .scaleExtent([0.2, 10])
    .on("zoom", function () {
        svg.selectAll('circle')
            .attr('transform', d3.event.transform);
        tooltip.attr('transform', d3.event.transform);
        // style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
    });


svg.call(zoom);

var xScale = null;
var yScale = null;

//Read the data
loaded_data = d3.csv(`${base_url}/data?g=sub_points`)
loaded_data.then(function (data) {
    xScale = d3.scaleLinear()
        .domain(d3.extent(data, (d) => d.x))
        .range([0, width])

    yScale = d3.scaleLinear()
        .domain(d3.extent(data, (d) => d.y))
        .range([0, height])

    // Initial Spots
    svg.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`)

    nodes = svg.selectAll("circle")
        .data(data)

    nodes.enter()
        .append("circle")
        .attr("cx", function (d) { return xScale(d.x); })
        .attr("cy", function (d) { return yScale(d.y); })
        .attr("r", "8px")
        // .style("fill", "#69b3a2")
        .style("fill", "rgb(172, 220, 114)")
        .style("opacity", 0.8)
        .on('mouseover', nodeOverFunction)
        .on('mousemove', () => tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px"))
        .on('mouseout', nodedOutFunction)

})


function nodeOverFunction(d){
    tooltip.style("visibility", "visible")
        .html(() => {
            const content = `<strong>Subreddit:</strong> <span>${d.sub}</span>`
            return content;
        })
    d3.select(this)
    .transition()
    .duration(100)
    .attr('r', '12px')
    
};

function nodedOutFunction(){
    d3.select(this)
    .transition()
    .duration(100)
    .attr('r', '8px')
    tooltip.style("visibility", "hidden")
}

tooltip = d3.select("body").append("div")
  .attr("class", "svg-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .text("I'm a circle!");
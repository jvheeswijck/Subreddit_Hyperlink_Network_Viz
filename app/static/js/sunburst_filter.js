// class SunBurstFilter{
//     constructor(element_selector){



//         this.svg = d3.select(element_selector)
//         .append("svg")
//         .attr("viewBox", "0 0 400 400")
//     }
//     load_data(){

//     }
// }


// tag_tree = null;
// d3.json('/data?g=tag_graph').then(function (d) {
//     //console.log(d);
//     tag_tree = d3.hierarchy(d);
//     tag_tree.sum((d) => d.values.length)
//     tag_tree.each(() => console.log('test'))
//     //console.log(tag_tree);

// });

var radius = (Math.min(width, height) / 3) -12 ; //- 10

var formatNumber = d3.format(",d");

var x = d3.scaleLinear()
  .range([0, 2*Math.PI]);

var y = d3.scaleSqrt()
  .range([0, radius]);

// var color = d3.scaleOrdinal(d3.schemeCategory20);

var partition = d3.partition();

var arc = d3.arc()
  .startAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
  .endAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
  .innerRadius(function (d) { return Math.max(0, y(d.y0)); })
  .outerRadius(function (d) { return Math.max(0, y(d.y1)); });


var svg = d3.select('#svg-sunburst')
.append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    //.attr("transform", "translate(" + width/2 + "," + (height/2) + ")");

tag_tree = null;



d3.json('/data?g=tag_graph').then(function (d) {
  //console.log(d);
  tag_tree = d3.hierarchy(d);
  tag_tree.sum((d) => d.values.length)
  tag_tree.each(() => console.log('test'))
  //console.log(tag_tree);

  // });
  // d3.json('/data?g=tag_graph', function(root) {
  // if (error) throw error; 
  // root = d3.hierarchy(root);
  // console.log(root)
  // root.sum(function(d) { return d.size; });
  path = svg.selectAll("path")

  path
    .data(partition(tag_tree).descendants())
    .enter().append("path")
    .attr("d", arc)
    .style("fill", 'green')
    .on("click", click)
    .append("title")
    .text(function (d) { return d.data.name + "\n" + formatNumber(d.value); });

  // console.log(svg.selectAll("path"))
});

function click(d) {
  svg.transition()
    .duration(750)
    .tween("scale", function () {
      var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
        yd = d3.interpolate(y.domain(), [d.y0, 1]),
        yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
      return function (t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
    })
    .selectAll("path")
    .attrTween("d", function (d) { return function () { return arc(d); }; });

    console.log(d.data.name)
    console.log(d.data.children)
    console.log(link_work)


}

d3.select(self.frameElement).style("height", height + "px");
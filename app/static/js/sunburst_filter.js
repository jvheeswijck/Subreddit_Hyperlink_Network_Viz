// class SunBurstFilter{
//     constructor(element_selector){



//         this.svg = d3.select(element_selector)
//         .append("svg")
//         .attr("viewBox", "0 0 400 400")
//     }
//     load_data(){

//     }
// }


tag_tree = null;
d3.json('/data?g=tag_graph').then(function(d){
    tag_tree = d3.hierarchy(d);
    tag_tree.sum((d) => d.values.length)
    // tag_tree.each(()=>console.log('test'))
});
class SunBurstFilter{
    constructor(element_selector){



        this.svg = d3.select(element_selector)
        .append("svg")
        .attr("viewBox", "0 0 400 400")
    }
    load_data(){

    }
}
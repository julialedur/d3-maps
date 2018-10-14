import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 300 - margin.top - margin.bottom
let width = 330 - margin.left - margin.right

let container = d3.select('#chart-6')

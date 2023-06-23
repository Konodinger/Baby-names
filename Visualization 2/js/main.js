
let yearStart = 1800
let yearEnd = 2023
let includeInvalidYears = true
let selectedDpt = -1
let selectedName = ""
let displayedNamesCount = 15

function showLoadingMask(v) {
  console.log("showLoadingMask "+v)
  if(v) {
    document.getElementById('loading-mask').style.display = 'flex';
  }
  else {
    document.getElementById('loading-mask').style.display = 'none';
  }
}
showLoadingMask(false)

const loadDataButton = document.getElementById('button-load-data')
loadDataButton.addEventListener("click", () => {
  showLoadingMask(true)
  loadData(() => {showLoadingMask(false)})
})
const checkIncludeInvalidYears = document.getElementById('input-year-check-invalid')
checkIncludeInvalidYears.addEventListener('change', (e) => {
  includeInvalidYears = checkIncludeInvalidYears.checked
})
const rangeStartInput = document.getElementById('input-year-range-start')
const rangeStartLabel = document.getElementById('label-year-range-start')
rangeStartInput.min = 1800
rangeStartInput.max = 2023
rangeStartInput.addEventListener('change', () => {
  rangeStartLabel.innerText = rangeStartInput.value
  yearStart = parseInt(rangeStartInput.value)
})
const rangeEndInput = document.getElementById('input-year-range-end')
const rangeEndLabel = document.getElementById('label-year-range-end')
rangeEndInput.min = 1800
rangeEndInput.max = 2023
rangeEndInput.addEventListener('change', () => {
  rangeEndLabel.innerText = rangeEndInput.value
  yearEnd = parseInt(rangeEndInput.value)
})

const dtpsChooseSelect = document.getElementById('choose-dtp-select')
dtpsChooseSelect.addEventListener('change', (e) => {
  selectedDpt = parseInt(dtpsChooseSelect.value)
  showLoadingMask(true)
  display_graphs().then(() => {showLoadingMask(false)})
})

const namesCountInput = document.getElementById('choose-names-input')
const namesCountButton = document.getElementById('choose-names-button')
namesCountButton.addEventListener('click', () => {
  displayedNamesCount = parseInt(namesCountInput.value)
  showLoadingMask(true)
  display_graphs().then(() => {showLoadingMask(false)})
})

const namesChooseSearchInput = document.getElementById('choose-name-search-input')
namesChooseSearchInput.addEventListener('change', () => {
  const value = namesChooseSearchInput.value + ""
  if(value.length>=3) {
    searched_names_list = names_list.filter(
      (name) => name.toUpperCase().includes(value.toUpperCase())
    )
  }
  else {
    searched_names_list = names_list.filter(
      (name) => name.length==value.length && name.toUpperCase().includes(value.toUpperCase())
    )
  }
  displayNamesSelection(searched_names_list)
  if(searched_names_list.length>0) namesChooseSelect.dispatchEvent(new Event('change'))
})

const namesChooseSelect = document.getElementById('choose-name-select')
namesChooseSelect.addEventListener('change', () => {
  selectedName = namesChooseSelect.value
  showLoadingMask(true)
  display_map().then(() => {showLoadingMask(false)})
})

function displayDptsSelection(dpts) {
  dpts.forEach((d) => {
    const option = document.createElement('option')
    option.innerText = d
    option.value = d
    dtpsChooseSelect.append(option)
  })
}
function displayNamesSelection(names) {
  // for(let i=0; i<namesChooseSelect.children.length; i++) {
  //   namesChooseSelect.removeChild(namesChooseSelect.children.item(i))
  // }
  namesChooseSelect.innerHTML = ""
  names.forEach((d) => {
    const option = document.createElement('option')
    option.innerText = d
    option.value = d
    namesChooseSelect.append(option)
  })
}

function isYearInRange(year) {
  if(includeInvalidYears && year==-1) return true

  return Math.min(yearStart, yearEnd) <= year
    && Math.max(yearStart, yearEnd) >= year
}









const SVG_GRAPH_WIDTH = 500
const SVG_GRAPH_HEIGHT = 300
const SVG_GRAPH_MARGIN = 50

let DATASET = []
let NAMES_DPT_COUNT = {}
let DPT_NAMES_COUNT = {}
let dpts_list = []
let names_list = []
let searched_names_list = []

let ttt = 0

function loadData(onFinish) {
  console.log("load data")
  d3.csv("data/dpt2020.csv",
      (d, i) => {
        ttt += 1
        return {
          name: d.preusuel,
          year: (d.annais=='XXXX')? -1 : parseInt(d.annais),
          count: parseInt(d.nombre),
          sex: d.sexe=="1"?'m':'f',
          dpt: (d.dpt=='XX')? -1 : parseInt(d.dpt)
        }
      }
    ).then((rows) => {
      console.log("Total count = "+ttt)
      console.log("Rows count = "+rows.length)
      DATASET = rows
      on_data_ready()
      if(onFinish) onFinish()
    })
}

async function on_data_ready() {
  console.log("on data ready")
  const d = compute(DATASET, yearStart, yearEnd)
  NAMES_DPT_COUNT = d.namesDptCounts
  DPT_NAMES_COUNT = d.dtpsNameCounts

  dpts_list = []
  names_list = []

  NAMES_DPT_COUNT.forEach((d, n) => {
    names_list.push(n)
  })
  DPT_NAMES_COUNT.forEach((n, d) => {
    dpts_list.push(parseInt(d))
  })
  names_list.sort((a, b) => {
    if(a>b) return 1
    else if(a==b) return 0
    else return -1
  })
  dpts_list.sort((a, b) => {
    if(a<0 && b>0) return 1
    if(a>0 && b<0) return -1
    if(a>b) return 1
    else if(a==b) return 0
    else return -1
  })

  display_data_overview()
  displayDptsSelection(dpts_list)

  await display_graphs()
  await display_map()
}

let namesPopularityChart = undefined
let namesTrendChart = undefined

function display_graphs() {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("display graphs")
      let dptNames
      if(selectedDpt<0) {
        dptNames = DPT_NAMES_COUNT.get(dpts_list[0])
        selectedDpt = dpts_list[0]
      }
      else {
        dptNames = DPT_NAMES_COUNT.get(selectedDpt)
      }

      console.log("selected department : ")
      console.log(selectedDpt)

      namesPopularityChart = display_graph_depts_names_bar_chart(
        selectedDpt, dptNames, displayedNamesCount
      )
      namesTrendChart = display_graph_depts_names_trend_bar_chart(
        selectedDpt, dptNames, displayedNamesCount
      )

      resolve()
    })
  })
}

function display_data_overview() {
  console.log("display overview")
  const labelRowsCount = document.getElementById('data-overview-rows-count')
  labelRowsCount.innerText = `Loaded ${DATASET.length} data rows.`

  const labelNamesCount = document.getElementById('data-overview-names-count')
  labelNamesCount.innerText = `${NAMES_DPT_COUNT.size} first names`

  const labelDptsCount = document.getElementById('data-overview-dpts-count')
  labelDptsCount.innerText = `${DPT_NAMES_COUNT.size} departments`
}

function display_graph_depts_names_bar_chart(dpt, namesCountsMap, names_count) {
  console.log("display popularities")
  const labelDpt = document.getElementById('chart-dept-names-bar-dpt')
  labelDpt.innerText = `First names popularities in department : ${dpt}`

  let items = []
  namesCountsMap.forEach((c, n) => {
    items.push({name: n, v: compute_name_popularity(n, dpt)})
  })
  items = items.sort((a, b) => {
    if(a.v > b.v) return -1
    else if(a.v < b.v) return 1
    else return 0
  })

  items = items.slice(0, Math.min(names_count, items.length))

  d3.selectAll("#chart-dept-names-bar > *").remove()
  return display_graph(
    items,
    'chart-dept-names-bar',
    'chart-dept-names-bar-details',
    "Popularity", " %")
}

function display_graph_depts_names_trend_bar_chart(dpt, namesCountsMap, names_count) {
  console.log("display trends")
  const labelDpt = document.getElementById('chart-dept-names-trend-bar-dpt')
  labelDpt.innerText = `First names trend in department ${dpt}`

  let items = []
  namesCountsMap.forEach((c, n) => {
    items.push({name: n, v: compute_name_dpt_trend(n, dpt)})
  })
  items = items.sort((a, b) => {
    if(a.v > b.v) return -1
    else if(a.v < b.v) return 1
    else return 0
  })

  items = items.slice(0, Math.min(names_count, items.length))

  d3.selectAll("#chart-dept-names-trend-bar > *").remove()
  return display_graph(
    items,
    'chart-dept-names-trend-bar',
    'chart-dept-names-trend-bar-details',
    "Tendancy", " %")
}

/*
items = {name: string, v: number}[]
*/
function display_graph(
  items,
  svgContainerId,
  detailLabelId,
  label,
  unit
) {
  const svgGraphDeptNamesBar = {}
  const svgContainer = document.getElementById(svgContainerId)
  svgGraphDeptNamesBar.svg = d3.select('#'+svgContainerId)
    .append('svg')
      .attr('width', svgContainer.clientWidth)
      .attr('height', svgContainer.clientHeight);
  svgGraphDeptNamesBar.margin = svgContainer.clientHeight*0.3
  svgGraphDeptNamesBar.w = svgContainer.clientWidth-svgGraphDeptNamesBar.margin*2
  svgGraphDeptNamesBar.h = svgContainer.clientHeight-svgGraphDeptNamesBar.margin*2
  svgGraphDeptNamesBar.names_count = 15
  svgGraphDeptNamesBar.bar_width = 10

  svgGraphDeptNamesBar.xScale = d3.scalePoint()
		.domain(["", ...items.map(item => item.name)])
		.range([0, svgGraphDeptNamesBar.w-50])
  svgGraphDeptNamesBar.yScale = d3.scaleLinear()
		.domain(d3.extent(items, (item) => item.v))
		.range([svgGraphDeptNamesBar.h-1, 0])

  svgGraphDeptNamesBar.g = svgGraphDeptNamesBar.svg.append('g')
    .attr('transform', `translate(${svgGraphDeptNamesBar.margin}, ${svgGraphDeptNamesBar.margin/2})`)

  svgGraphDeptNamesBar.g.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0, '+(svgGraphDeptNamesBar.h)+')')
    .style("font-size", '0.6rem')
    .style("font-weight", 'bold')
		.call(d3.axisBottom(svgGraphDeptNamesBar.xScale))
      .selectAll('text')
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");
  svgGraphDeptNamesBar.g.append('g')
		.attr('class', 'y axis')
    .style("font-size", '0.6rem')
    .style("font-weight", 'bold')
		.call(d3.axisLeft(svgGraphDeptNamesBar.yScale))

  svgGraphDeptNamesBar.g.selectAll('.bar')
    .data(items)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('fill', "#aa5555")
    .attr('x', (item) => {return svgGraphDeptNamesBar.xScale(item.name)-svgGraphDeptNamesBar.bar_width/2})
    .attr('y', (item) => {return svgGraphDeptNamesBar.yScale(item.v)})
    .attr('width', svgGraphDeptNamesBar.bar_width)
    .attr('height', (item) => {
      return svgGraphDeptNamesBar.h-svgGraphDeptNamesBar.yScale(item.v)
    })
    .on('mouseover', (d, i) => {
      const rect = d.target
      const labelDetails = document.getElementById(detailLabelId)
      labelDetails.innerText = `${label} of ${i.name} : ${Math.round(i.v*100)/100}${unit}`
    })
    .on('mouseout', (d, i) => {
      const rect = d.target
      const labelDetails = document.getElementById(detailLabelId)
      labelDetails.innerText = "---"
    })
  return svgGraphDeptNamesBar
}







/*
Count the number of birth with a name in a department over the years.
Returns the names mapped to the department name count :
- name1 => {dep1 => 20, dep2 => 40 }
*/
function compute(rows) {
  const namesDptCounts = new Map()
  const dtpsNameCounts = new Map()
  rows.forEach((r) => {
    if(isYearInRange(r.year)) {
      let byDpts = namesDptCounts.get(r.name)
      if(byDpts==undefined) {
        byDpts = new Map()
        namesDptCounts.set(r.name, byDpts)
      }
      let dpt = byDpts.get(r.dpt)
      if(dpt==undefined) {
        dpt = 0
        byDpts.set(r.dpt, dpt)
      }
      byDpts.set(r.dpt, dpt+r.count)
      
      let byNames = dtpsNameCounts.get(r.dpt)
      if(byNames==undefined) {
        byNames = new Map()
        dtpsNameCounts.set(r.dpt, byNames)
      }
      let name = byNames.get(r.name)
      if(name==undefined) {
        name = 0
        byNames.set(r.name, name)
      }
      byNames.set(r.name, name+r.count)
    }
  })

  return {namesDptCounts, dtpsNameCounts}
}

function compute_name_popularity(name, dpt) {
  const namesCount = DPT_NAMES_COUNT.get(dpt)
  if(namesCount) {
    let count = namesCount.get(name)
    let total = 0
    if(count != undefined) {
      namesCount.forEach((c, n) => {
        total = total + c
      })
    }
    if(total==0) return 0
    return (count/total)*100
  }
  return 0
}

function compute_name_dpt_trend(name, dpt) {
  const pop = compute_name_popularity(name, dpt)
  let totalPop = 0
  DPT_NAMES_COUNT.forEach((_, d) => {
    totalPop = totalPop + compute_name_popularity(name, d)
  })
  if(totalPop==0) return 0
  return (pop/totalPop)*100
}









let PATH_map
let DEPS_map
let WIDTH_map
let HEIGHT_map
function display_map() {

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Display map")
      WIDTH_map = document.getElementById("map").clientWidth;
      HEIGHT_map = document.getElementById("map").clientHeight;
      
      PATH_map = d3.geoPath();
      var projection = d3.geoConicConformal() // Lambert-93
        .center([2.454071, 47.279229]) // Centers the map on the center of France
        .scale(3800)
        .translate([WIDTH_map / 2, HEIGHT_map / 2]);
    
      PATH_map.projection(projection); // Assign the projecttion to the path

      d3.selectAll("#map > *").remove()
      var svg = d3.select('#map').append("svg")
        .attr("width", WIDTH_map)
        .attr("height", HEIGHT_map);
      DEPS_map = svg
        .append("g")
          .attr("id", "departements");

      if(selectedName.length==0) {
        selectedName = names_list[0]
        displayNamesSelection([selectedName])
      }

      document.getElementById('map-name-dept-name').innerText = "Postal code : "
      document.getElementById('map-name-dept-popularity').innerText = "Popularity : "

      d3.json('data/departements.json')
      .then((geojson) => {
        DEPS_map.selectAll("path")
          .data(geojson.features)
          .enter()
          .append("path")
            .attr('class', 'departement')
            .attr('stroke', 'white')
            .attr('fill', 'gray')
            .attr("d", PATH_map)
            .on('click', countyClickHandler)
            .on('mouseover', (el, d) => {
              const dpt = parseInt(d.properties.CODE_DEPT)
              let pop = compute_name_popularity(selectedName, dpt)
              pop = Math.round(pop*100000)/100000
              document.getElementById('map-name-dept-name').innerText = "Postal code : "+dpt
              document.getElementById('map-name-dept-popularity').innerText = "Popularity : "+pop+"%"
            })
        DEPS_map.selectAll("text")
          .data(geojson.features)
          .enter()
          .append("text")
            .attr("x", (d) => {
              var centroid = PATH_map.centroid(d);
              return centroid[0];
            })
            .attr("y", (d) => {
              var centroid = PATH_map.centroid(d);
              return centroid[1];
            })
            .attr("fill", "black")
            .attr("font-weight", "bold")
            .attr("font-size", "0.75rem")
            .text((d) => {
              const dpt = parseInt(d.properties.CODE_DEPT)
              let pop = compute_name_popularity(selectedName, dpt)
              pop = Math.round(pop*100)/100
              return pop+"%"
            });
        console.log('done')
      })
      .catch((e) => {
        console.log(e)
      })

      resolve()
    })
  })
}

let centered;
function countyClickHandler(t, d) {
  var x, y, k

  if (d && centered !== d) {
    var centroid = PATH_map.centroid(d)
    x = centroid[0]
    y = centroid[1]
    k = 5
    centered = d
    DEPS_map.selectAll("text")
      .attr("font-size", "0.2rem")
  } else {
    x = WIDTH_map / 2
    y = HEIGHT_map / 2
    k = 1
    centered = null
    DEPS_map.selectAll("text")
      .attr("font-size", "0.75rem")
  }

  DEPS_map.selectAll("path")
    .classed("active", centered && function(d) { return d === centered; })

  var trStr = "translate(" + WIDTH_map / 2 + "," + HEIGHT_map / 2 + ")" +
    "scale(" + k + ")translate(" + -x + "," + -y + ")"

  DEPS_map.transition()
    .duration(1000)
    .attr("transform", trStr)

};

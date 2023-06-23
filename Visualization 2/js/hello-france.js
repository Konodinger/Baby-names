
const w = 600;
const h = 600;
let dataset = [];

let detailDiv = document.getElementById('details')

let svg = d3.select('#chart')
	.append('svg')
		.attr('width', w)
		.attr('height', h);

let xScale
let yScale
let densityScale
let popScale

d3.tsv("data/france.tsv",
		(d, i) => {
			return {
				codePostal: +d["Postal Code"],
				inseeCode: +d.inseecode,
				place: d.place,
				longitude: +d.x,
				latitude: +d.y,
				population: +d.population,
				density: +d.density
			};
		}
	)
	.then((rows) => {
		console.log(`Loaded ${rows.length} rows.`);
		if(rows.length > 0) {
			console.log("First row : ", rows[0]);
			console.log("Last row : ", rows[rows.length-1]);
		}
		dataset = rows;

		// x = d3.scalePow().exponent(5)
		xScale = d3.scaleLinear()
		.domain(d3.extent(dataset, (row) => row.longitude))
		.range([0, w])
		
		// y = d3.scalePow().exponent(5)
		yScale = d3.scaleLinear()
			.domain(d3.extent(dataset, (row) => row.latitude))
			.range([h, 0])

		densityScale = d3.scalePow().exponent(0.8)
			.domain(d3.extent(dataset, (row) => row.density))
			.range([2, 15])

		popScale = d3.scalePow().exponent(0.1)
			.domain(d3.extent(dataset, (row) => row.population))
			.range([20, 256])

		draw();
	})
	.catch((error) => {
		console.log("Something went wrong : ", error);
	});

function clear() {
	d3.selectAll("svg > *").remove();
}

function draw() {
	// svg.selectAll("rect")
	// 	.data(dataset)
	// 	.enter()
	// 	.append("rect")
	// 	.attr("width", 1)
	// 	.attr("height", 1)
	// 	.attr("x", (d) => x(d.longitude))
	// 	.attr("y", (d) => y(d.latitude))

	svg.selectAll("circle")
		.data(dataset)
		.enter()
		.append("circle")
		.attr("cx", (d) => xScale(d.longitude))
		.attr("cy", (d) => yScale(d.latitude))
		.attr("r", (d) => densityScale(d.density))
		.attr('stroke', 'black')
		.attr("fill", (d) => {
			const c = parseInt(popScale(d.population))
			return "rgb("+c+", "+c+", "+c+")"
		})
		.on('mouseover', (d) => {
			let data = undefined
			let minDist = Number.MAX_VALUE
			dataset.forEach((v) => {
				const dist = distance(
					{x: xScale(v.longitude), y: yScale(v.latitude)},
					{
						x: parseInt(getComputedStyle(d.target).cx),
						y: parseInt(getComputedStyle(d.target).cy)
					}
				)
				if(minDist >= dist) {
					minDist = dist
					data = v
				}
			})
	
			if(data) {
				let text = ""
				text += "Postal Code : " + data.codePostal +" <br>"
				text += "Name : " + data.place +" <br>"
				text += "Population : " + data.population +" <br>"
				text += "Density : " + data.density +" <br>"
				detailDiv.innerHTML = text
			}
		})

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0, "+h+")")
		.call(d3.axisTop(xScale))

	svg.append("g")
		.attr("class", "y axis")
		.call(d3.axisRight(yScale))
}

function distance(v, u) {
	const xdiff = v.x - u.x
	const ydiff = v.y - u.y
	return xdiff*xdiff + ydiff*ydiff
}

var Person = function()
{
	this.isLookingForPartner = false;
	this.isInfected = false;
	this.expectedPartnersPerYear = 0.0;
	this.partner = null;
	this.partnersCount = 0;
}

// static variables

var daysPerYear = 365;

// program variables

var programRunning = true;

// simulation variables

var steps;

var lastDrawTime = 0;

var lastLogicTime = 0;

var lastFrameTime = 0;

var currentFrameMillis;

var population;

var lookingForPartnerPopulation;

var lookingForPartnerPopulationSize;

var infectedHistory;

var infectedPartialHistory;

var infectedPopulationCount;

var matched;

// other variables

var programFrameRate = 5;

var maxSteps = 7000;

var startPopulationCount = 50000;

var meanPartnersPerYear = 2.75;

var meanPartnersPerStep = meanPartnersPerYear / daysPerYear;

var exposureRisk = 0.1;

var startInfectedPopulationCount = 10;

var infectedPartialHistorySize = 100;

function initializeSimulationVariables()
{
	steps = 0;
	population = [];
	lookingForPartnerPopulation = []
	lookingForPartnerPopulationSize = 0;
	infectedHistory = [];
	infectedPartialHistory = [];
	infectedPopulationCount = 0;
	matched = 0;
	
	for(var i = 0; i < startPopulationCount; ++i)
	{
		var p = new Person();
		p.expectedPartnersPerYear = meanPartnersPerYear;
		population.push(p);
		lookingForPartnerPopulation.push(p);
	}
	
	for(var i = 0; i < startInfectedPopulationCount; ++i)
	{
		var p = population[floor(random(population.length))];
		while(p.isInfected)
		{
			p = population[int(random(population.length))];
		}
		p.isInfected = true;
		++infectedPopulationCount;
	}
	
	currentFrameMillis = millis();
}

// elements

var restartButton;

function onRestartButtonClicked() {
	
}

var populationSizeSlider;

var populationSizes = [1000, 2000, 5000, 10000, 20000, 50000, 100000]

var infectedChart;

var infectedChartSeries;

function setup() {
	createCanvas(windowWidth, windowHeight);
	
	restartButton = createButton("Restart");
	restartButton.position(100, 0);
	restartButton.mouseClicked(onRestartButtonClicked);
	
	populationSizeSlider = createSlider(0, populationSizes.length - 1, 3);
	populationSizeSlider.position(0, 50);
	
	infectedChart = new Highcharts.Chart({
		chart: {
			renderTo: 'infected-chart',
			type: 'line',
			animation: false
		},
		plotOptions: {
			column: {
				animation: false
			},
			line: {
				marker: {
					enabled: false
				}
			}
		},
		title: {
			text: 'Infected population'
		},
		xAxis: {
			title: {
				text: 'Steps'
			}
		},
		yAxis: {
			title: {
				text: 'Infected'
			}
		},
		series: [{
			name: 'Global',
			data: []
		}]
	});
	infectedChartSeries = infectedChart.series[0];
	
	initializeSimulationVariables();
	
	frameRate(programFrameRate);
	textSize(20);
}

function logic()
{
	if(steps == 0) {
		currentMillis = millis();
	}
	var start = millis();
	step();
	console.log("start:", start);
	console.log("end:", start + 1000/programFrameRate - lastDrawTime);
	while(steps < maxSteps && (millis() < (start + 1000/programFrameRate - lastDrawTime))) {
		step();
	}
}

function draw() {
	var newCurrentFrameMillis = millis();
	lastFrameTime = newCurrentFrameMillis - currentFrameMillis;
	currentFrameMillis = newCurrentFrameMillis;
	
	
	var drawStart = millis();
	
	background(255);
	
	textAlign(CENTER);
	text(populationSizes[populationSizeSlider.value()], 100, 45);
	
	textAlign(LEFT);
	text("Steps: " + steps, 200, 30);
	text("Draws: " + frameCount, 350, 30);
	text("Population: " + startPopulationCount, 500, 30);
	text("Total infected: " + infectedPopulationCount, 750, 30);
	var infectedPartialHistorySum = 0;
	for(var i = 0; i < infectedPartialHistory.length; ++i) infectedPartialHistorySum += infectedPartialHistory[i];
	text("Infected in last " + infectedPartialHistorySize + " steps: " + infectedPartialHistorySum, 1000, 30);
	text("Matched: " + (matched * daysPerYear / steps / startPopulationCount).toFixed(2), 200, 70);
	text("Logic: " + floor(lastLogicTime), 400, 70);
	text("Draw: " + floor(lastDrawTime), 550, 70);
	text("Frame: " + floor(lastFrameTime), 700, 70);
	
	infectedChart.redraw();
	
	var drawEnd = millis();
	lastDrawTime = drawEnd - drawStart;
	
	var start = millis();
	if(programRunning && steps < maxSteps) {
		logic();
	}
	var end = millis();
	lastLogicTime = end - start;
}

function lookForPartners()
{
	for(var i = lookingForPartnerPopulationSize; i < lookingForPartnerPopulation.length; ++i)
	{
		var p = lookingForPartnerPopulation[i];
		p.isLookingForPartner = random(1.0) < (p.expectedPartnersPerYear / daysPerYear);
		if(p.isLookingForPartner)
		{
			lookingForPartnerPopulation[i] = lookingForPartnerPopulation[lookingForPartnerPopulationSize];
			lookingForPartnerPopulation[lookingForPartnerPopulationSize] = p;
			++lookingForPartnerPopulationSize;
		}
	}
}

function matchPartners()
{
	for(var i = 0; i < lookingForPartnerPopulationSize;)
	{
		var pi = lookingForPartnerPopulation[i];
		for(var j = 0; j < lookingForPartnerPopulationSize; ++j)
		{
			var pj = lookingForPartnerPopulation[j];
			if(pi != pj)
			{
				lookingForPartnerPopulation[i] = lookingForPartnerPopulation[lookingForPartnerPopulationSize - 1];
				lookingForPartnerPopulation[j] = lookingForPartnerPopulation[lookingForPartnerPopulationSize - 2];
				lookingForPartnerPopulation[lookingForPartnerPopulationSize - 2] = pi;
				lookingForPartnerPopulation[lookingForPartnerPopulationSize - 1] = pj;
				if(pi.partner) pi.partner.partner = null;
				if(pj.partner) pj.partner.partner = null;
				pi.partner = pj;
				pj.partner = pi;
				pi.partnersCount += 1;
				pj.partnersCount += 1;
				pi.isLookingForPartner = false;
				pj.isLookingForPartner = false;
				lookingForPartnerPopulationSize -= 2;
				matched += 2;
				break;
			}
		}
		if(pi.isLookingForPartner)
		{
			++i;
		}
	}
}

function haveSex()
{
	var infected = 0;
	for(var i = 0; i < population.length; ++i)
	{
		var p = population[i];
		if(p.partner && p.partner.isInfected && !p.isInfected)
		{
			p.isInfected = random(1.0) < exposureRisk;
			if(p.isInfected) infected += 1;
		}
	}
	infectedPopulationCount += infected;
	infectedHistory.push(infectedPopulationCount / population.length);
	if(infectedPartialHistory.length == infectedPartialHistorySize) infectedPartialHistory.splice(0, 1);
	infectedPartialHistory.push(infected);
	
	if(steps % 10 == 1)
	infectedChartSeries.addPoint(infectedPopulationCount, false);
}

function step()
{
	++steps;
	
	lookForPartners();
	
	matchPartners();
	
	haveSex();
}

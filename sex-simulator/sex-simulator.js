// infections

var minLatentPeriod;

var maxLatentPeriod;

var minInfectivityPeriod;

var maxInfectivityPeriod;

//var minIncubationPeriod = 0;

//var maxIncubationPeriod = 0;

var exposureRisk;

function Infection()
{
	this.duration = 0;
	this.latentPeriod = floor(random(minLatentPeriod, maxLatentPeriod + 1));
	this.infectivityPeriod = floor(random(minInfectivityPeriod, maxInfectivityPeriod + 1));
	//this.incubationPeriod = floor(random(minIncubationPeriod, maxIncubationPeriod + 1));
	this.exposureRisk = exposureRisk;
	
	this.infect = function(person)
	{
		person.infections.push(new Infection());
	}
}

var Person = function()
{
	this.isLookingForPartner = false;
	this.isInfected = false;
	this.infections = [];
	this.expectedPartnersPerYear = 0.0;
	this.partner = null;
	this.partnersCount = 0;
}

// static variables

var daysPerYear = 365;

// program variables

var programRunning = false;

// simulation variables

var steps;

var lastDrawTime = 0;

var lastLogicTime = 0;

var lastFrameTime = 0;

var currentFrameMillis;

var population;

var populationCount;

var meanPartnersPerYear;

var lookingForPartnerPopulation;

var lookingForPartnerPopulationSize;

var infectedHistory;

var infectedPartialHistory;

var infectedPopulationCount;

var matched;

// other variables

var programFrameRate = 10;

var maxSteps = 10000;

var startInfectedPopulationCount = 100;

var infectedPartialHistorySize = 100;

function initializeSimulationVariables()
{
	steps = 0;
	population = [];
	populationCount = populationSizes[populationSizeSlider.value()];
	meanPartnersPerYear = meanPartnersPerYearSlider.value() / 20;
	lookingForPartnerPopulation = []
	lookingForPartnerPopulationSize = 0;
	
	minLatentPeriod = infectionMinLatentPeriodSlider.value();
	maxLatentPeriod = infectionMaxLatentPeriodSlider.value();
	maxLatentPeriod = max(minLatentPeriod, maxLatentPeriod);
	
	minInfectivityPeriod = infectionMinInfectivityPeriodSlider.value();
	maxInfectivityPeriod = infectionMaxInfectivityPeriodSlider.value();
	maxInfectivityPeriod = max(minInfectivityPeriod, maxInfectivityPeriod);
	
	exposureRisk = infectionExposureRiskSlider.value() / 100;
	
	infectedHistory = [];
	infectedPartialHistory = [];
	infectedPopulationCount = 0;
	
	matched = 0;
	
	var deviation = sqrt(2*log(meanPartnersPerYear));
	for(var i = 0; i < populationCount; ++i)
	{
		var p = new Person();
		p.expectedPartnersPerYear = exp(randomGaussian(0, deviation));
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
		var inf = new Infection();
		inf.duration = floor(random(0, inf.latentPeriod + inf.infectivityPeriod + 1));
		p.infections.push(inf);
		p.isInfected = true;
		++infectedPopulationCount;
	}
	
	currentFrameMillis = millis();
}

// elements

var startStopButton;

function onStartStopButtonClicked() {
	programRunning = !programRunning;
	
	if(programRunning) {
		initializeSimulationVariables();
	}
}

var restartButton;

function onRestartButtonClicked() {
	initializeSimulationVariables();
}

var populationSizeSlider;

var populationSizes = [1000, 2000, 5000, 10000, 20000, 50000, 100000]

var meanPartnersPerYearSlider;

var infectionMinLatentPeriodSlider;

var infectionMaxLatentPeriodSlider;

var infectionMinInfectivityPeriodSlider;

var infectionMaxInfectivityPeriodSlider;

//var infectionMinIncubationPeriodSlider;

//var infectionMaxIncubationPeriodSlider;

var infectionExposureRiskSlider;

var infectedChart;

var infectedChartSeries;

function setup() {
	createCanvas(windowWidth, windowHeight);
	
	startStopButton = createButton("Start/Stop");
	startStopButton.text = "Derp";
	startStopButton.position(10, 10);
	startStopButton.mouseClicked(onStartStopButtonClicked);
	
	restartButton = createButton("Restart");
	restartButton.position(120, 10);
	restartButton.mouseClicked(onRestartButtonClicked);
	
	populationSizeSlider = createSlider(0, populationSizes.length - 1, 3);
	populationSizeSlider.position(0, 90);
	
	meanPartnersPerYearSlider = createSlider(20, 200, 55);
	meanPartnersPerYearSlider.position(0, 160)
	
	infectionMinLatentPeriodSlider = createSlider(0, 100, 2);
	infectionMinLatentPeriodSlider.position(0, 250);
	
	infectionMaxLatentPeriodSlider = createSlider(0, 100, 7);
	infectionMaxLatentPeriodSlider.position(0, 340);
	
	infectionMinInfectivityPeriodSlider = createSlider(1, 200, 30);
	infectionMinInfectivityPeriodSlider.position(0, 430);
	
	infectionMaxInfectivityPeriodSlider = createSlider(1, 200, 120);
	infectionMaxInfectivityPeriodSlider.position(0, 520);
	
	infectionExposureRiskSlider = createSlider(1, 100, 5);
	infectionExposureRiskSlider.position(0, 590);
	
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
				text: 'Days'
			}
		},
		yAxis: {
			title: {
				text: 'Infected'
			}
		},
		series: [{
			name: 'All infected',
			data: []
		}]
	});
	infectedChartSeries = infectedChart.series[0];
	
	initializeSimulationVariables();
	
	frameRate(programFrameRate);
	textSize(16);
}

function logic()
{
	if(steps == 0) {
		currentMillis = millis();
	}
	var start = millis();
	step();
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
	
	textAlign(LEFT);
	text("Population size:", 10, 60);
	textAlign(CENTER);
	text(populationSizes[populationSizeSlider.value()], 100, 80);

	textAlign(LEFT);
	text("Mean partners per year:", 10, 130);
	textAlign(CENTER);
	text((meanPartnersPerYearSlider.value()/20).toFixed(2), 100, 150);
	
	textAlign(LEFT);
	text("Infection minimum\nlatent period:", 10, 200);
	textAlign(CENTER);
	text(infectionMinLatentPeriodSlider.value(), 100, 240);
	
	textAlign(LEFT);
	text("Infection maximum\nlatent period:", 10, 290);
	textAlign(CENTER);
	text(infectionMaxLatentPeriodSlider.value(), 100, 330);

	textAlign(LEFT);
	text("Infection minimum\ninfectivity period:", 10, 380);
	textAlign(CENTER);
	text(infectionMinInfectivityPeriodSlider.value(), 100, 420);
	
	textAlign(LEFT);
	text("Infection maximum\ninfectivity period:", 10, 470);
	textAlign(CENTER);
	text(infectionMaxInfectivityPeriodSlider.value(), 100, 510);
	
	textAlign(LEFT);
	text("Infection exposure risk:", 10, 560);
	textAlign(CENTER);
	text(infectionExposureRiskSlider.value() + "%", 100, 580);

	textAlign(LEFT);
	text("Days: " + steps, 250, 30);
	//text("Draws: " + frameCount, 350, 30);
	text("Population: " + populationCount, 400, 30);
	text("Total infected: " + infectedPopulationCount, 600, 30);
	var infectedPartialHistorySum = 0;
	for(var i = 0; i < infectedPartialHistory.length; ++i) infectedPartialHistorySum += infectedPartialHistory[i];
	text("Infected in last " + infectedPartialHistorySize + " days: " + infectedPartialHistorySum, 850, 30);
	//text("Matched: " + (matched * daysPerYear / steps / populationCount).toFixed(2), 250, 70);
	//text("Logic: " + floor(lastLogicTime), 400, 70);
	//text("Draw: " + floor(lastDrawTime), 550, 70);
	//text("Frame: " + floor(lastFrameTime), 700, 70);
	text("Min. latent period: " + minLatentPeriod, 250, 50);
	text("Max. latent period: " + maxLatentPeriod, 250, 70);
	text("Min. infectivity period: " + minInfectivityPeriod, 500, 50);
	text("Max. infectivity period: " + maxInfectivityPeriod, 500, 70);
	text("Exposure risk: " + (exposureRisk * 100) + "%", 800, 50);
	
	infectedChartSeries.setData(infectedHistory);
	//infectedChart.redraw();
	
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
	for(var i = 0; i < population.length; ++i)
	{
		var p = population[i];
		for(var j = p.infections.length - 1; j >= 0; --j)
		{
			var inf = p.infections[j]
			inf.duration += 1;
			if(inf.duration > (inf.latentPeriod + inf.infectivityPeriod)) {
				p.infections.splice(j, 1);
				if(p.infections.length == 0) {
					p.isInfected = false;
					infectedPopulationCount -= 1;
				}
			}
		}
	}
	
	var infected = 0;
	for(var i = 0; i < population.length; ++i)
	{
		var p = population[i];
		if(!p.partner) continue;
		for(var j = 0; j < p.infections.length; ++j)
		{
			var inf = p.infections[j];
			if(inf.duration <= inf.latentPeriod) continue;
			var partnerHasInfection = false;
			var pp = p.partner;
			for(var k = 0; k < pp.infections.length; ++k) {
				if(pp.infections[k].constructor === inf.constructor) {
					partnerHasInfection = true;
					break;
				}
			}
			if(!partnerHasInfection) {
				partnerHasInfection = random(1.0) < inf.exposureRisk;
				if(partnerHasInfection) {
					inf.infect(pp);
					if(pp.infections.length == 1) {
						infected += 1;
					}
				}
			}
		}
	}
	
	infectedPopulationCount += infected;
	infectedHistory.push(infectedPopulationCount / population.length);
	if(infectedPartialHistory.length == infectedPartialHistorySize) infectedPartialHistory.splice(0, 1);
	infectedPartialHistory.push(infected);
	
	//if(steps % 10 == 1)
	//infectedChartSeries.addPoint(infectedPopulationCount, false);
}

function step()
{
	++steps;
	
	lookForPartners();
	
	matchPartners();
	
	haveSex();
}

int steps = 0;

int millisFirstStep;

int daysPerYear = 365;

int startPopulationCount = 100000;

Person[] population = new Person[startPopulationCount];

float meanPartnersPerYear = 2.75;

float meanPartnersPerStep = meanPartnersPerYear / daysPerYear;

ArrayList<Person> lookingForPartnerPopulation = new ArrayList<Person>();

float exposureRisk = 0.01;

int startInfectedPopulationCount = 10;

int infectedPopulationCount = 0;

int matched = 0;

int infectedHistorySize = 100;

ArrayList<int> infectedHistory = new ArrayList<int>();

void setup()
{
	size(1200, 500);

	for(int i = 0; i < startPopulationCount; ++i)
	{
		Person p = new Person();
		p.expectedPartnersPerYear = meanPartnersPerYear;
		population[i] = p;
	}
	
	for(int i = 0; i < startInfectedPopulationCount; ++i)
	{
		Person p;
		p = population[int(random(population.length))];
		while(p.isInfected)
		{
			p = population[int(random(population.length))];
		}
		p.isInfected = true;
		++infectedPopulationCount;
	}
	
	frameRate(60);
}

void draw()
{
	logic();

	background(100);
	PFont font;
	font = createFont("Arial", 16, true);
	textFont(font, 16);
	fill(255);
	text("Steps: " + steps, 10, 20);
	text("Draws: " + frameCount, 10, 35);
	//text("Matched: " + (matched * daysPerYear / steps / startPopulationCount), 10, 60);
	text("Population: " + startPopulationCount, 10, 60);
	text("Total infected: " + infectedPopulationCount, 10, 75);
	int infectedHistorySum = 0;
	for(int i = 0; i < infectedHistory.size(); ++i) infectedHistorySum += infectedHistory.get(i);
	text("Infected in last " + infectedHistorySize + " steps: " + infectedHistorySum, 10, 90);
}

void logic()
{
	if(steps == 0)
	{
		millisFirstStep = millis();
	}
	step();
	ms = ((millis() - millisFirstStep) / frameCount);
	while(((millis() - millisFirstStep) / frameCount) < (1 * 1000 / 60))
	{
		step();
	}
}

void step()
{
	++steps;
	
	for(int i = 0; i < population.length; ++i)
	{
		Person p = population[i];
		if(!p.isLookingForPartner)
		{
			p.isLookingForPartner = random(1.0) < (p.expectedPartnersPerYear / daysPerYear);
			if(p.isLookingForPartner)
			{
				lookingForPartnerPopulation.add(p);
			}
		}
	}
	
	for(int i = 0; i < lookingForPartnerPopulation.size(); ++i)
	{
		Person pi = lookingForPartnerPopulation.get(i);
		if(pi.isLookingForPartner)
		{
			for(int j = 0; j < lookingForPartnerPopulation.size(); ++j)
			{
				Person pj = lookingForPartnerPopulation.get(j);
				if(pi != pj && pj.isLookingForPartner)
				{
					if(pi.partner) pi.partner.partner = null;
					pi.partner = pj;
					pi.partersCount += 1;
					pi.isLookingForPartner = false;
					if(pj.partner) pj.partner.partner = null;
					pj.partner = pi;
					pj.partnersCount += 1;
					pj.isLookingForPartner = false;
					matched += 2;
					break;
				}
			}
		}
	}
	
	// remove from lookingForPartnerPopulation list those who doesn't looking for partners
	for(int i = lookingForPartnerPopulation.size() - 1; i >= 0; --i)
	{
		if(!lookingForPartnerPopulation.get(i).isLookingForPartner)
		{
			lookingForPartnerPopulation.remove(i);
		}
	}
	
	// having sex
	int infected = 0;
	for(int i = 0; i < population.length; ++i)
	{
		Person p = population[i];
		if(p.partner && p.partner.isInfected && !p.isInfected)
		{
			p.isInfected = random(1.0) < exposureRisk;
			if(p.isInfected) infected += 1;
		}
	}
	infectedPopulationCount += infected;
	if(infectedHistory.size() == infectedHistorySize) infectedHistory.remove(0);
	infectedHistory.add(infected);
}

class Person
{
	boolean isLookingForPartner = false;
	boolean isInfected = false;
	float expectedPartnersPerYear = 0.0;
	Person partner = null;
	int partnersCount = 0;
	
	Person()
	{
	}
}

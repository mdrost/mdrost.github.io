int steps = 0;

int daysPerYear = 365;

int startPopulationCount = 10000;

Person[] population = new Person[startPopulationCount];

float meanPartnersPerYear = 2.75;

float meanPartnersPerStep = meanPartnersPerYear / daysPerYear;

ArrayList<Person> lookingForPartnerPopulation = new ArrayList<Person>();

float exposureRisk = 0.01;

int startInfectedPopulationCount = 100;

int infectedPopulationCount = 0;

int matched = 0;

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
	text("Infected: " + infectedPopulationCount, 10, 60);
	text("Matched: " + (matched * daysPerYear / steps / startPopulationCount), 10, 75);
}

void logic()
{
	step();
	while((millis() / frameCount) < (1000 / 60))
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
				p.isLookingForPartner = true;
				lookingForPartnerPopulation.add(p);
			}
		}
	}
	
	//println("size: " + lookingForPartnerPopulation.size());
	for(int i = 0; i < lookingForPartnerPopulation.size(); ++i)
	{
		Person pi = lookingForPartnerPopulation.get(i);
		if(pi.isLookingForPartner)
		{
			//println("isLooking");
			for(int j = 0; j < lookingForPartnerPopulation.size(); ++j)
			{
				Person pj = lookingForPartnerPopulation.get(j);
				if(pi != pj && pj.isLookingForPartner)
				{
					//println("Partnes matched!");
					pi.partner = pj;
					pi.isLookingForPartner = false;
					pj.partner = pi;
					pj.isLookingForPartner = false;
					matched += 2;
					break;
				}
			}
		}
	}
	
	for(int i = lookingForPartnerPopulation.size() - 1; i >= 0; --i)
	{
		if(!lookingForPartnerPopulation.get(i).isLookingForPartner)
		{
			//println("removing");
			lookingForPartnerPopulation.remove(i);
		}
	}
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

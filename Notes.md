Dit bestand beschrijft in hoofdlijnen mijn gedachtegang en werkwijze tijdens dit project. Niet alles zal hierin staan, maar die zaken kan ik tijdens het assessment toelichten.

# Keuzes en afwegingen

Een van de eerste afwegingen die ik moest maken was: hoe laten we de input werken? Wil ik een score per beurt, of wil ik punten per pijl invoeren? Komen er losse knoppen om te selecteren wat ik gegooid heb? Uiteindelijk ben ik gegaan voor de methode met een score per pijl. Dit maakt het valideren van de checkout eenvoudiger, door te controleren of de laatst ingevoerde pijl een even getal (dubbel) is. Daarnaast scheelt dit de speler rekenwerk, omdat de app zelf berekent wat de totaalscore is van de beurt.

Hierbij heb ik ervoor gezorgd dat een speler alleen een haalbare score per pijl kan invoeren, waardoor het onmogelijk is om een score als 59 of 58 in te vullen. Hoewel ik ervan uitga dat spelers altijd eerlijk hun scores invoeren, kan het altijd zijn dat een speler een typfout maakt. Een speler kan dus geen score invoeren die met één pijl niet mogelijk is.

In eerste instantie had ik ook nog een checkbox met "last dart double" die als controle moest werken om zeker te weten dat de speler op een dubbel heeft uitgegooid. Uiteindelijk heb ik deze weggehaald, omdat ik ervan uitga dat spelers eerlijk invullen wat zij hebben gegooid. Het voorkomen van valsspel hoort niet de functie van een dartcomputer te zijn.

Als een speler na een beurt op 1 of op een negatief getal uitkomt, wordt dat als nulpoging beschouwd. De speler blijft dan staan op de score waarmee hij de beurt inging. De punten per pijl worden opgeschreven in het overzicht, maar niet meegenomen in de statistieken (elke pijl telt alsnog voor 0). Ik heb ook een knop "no score" toegevoegd, om snel aan te kunnen geven dat er geen score genoteerd is.

Om de functionaliteit van de frontend te scheiden, heb ik aparte .ts- en .tsx-bestanden aangehouden. Het regelen van de score, het berekenen van de statistieken of het vinden van de beste checkout gebeurt in andere bestanden dan het weergeven van de voortgang van het spel.

Het berekenen van een ideale checkout wordt gedaan via een algoritme. Het handmatig bijhouden van alle mogelijke checkouts wordt chaotisch en onoverzichtelijk, terwijl een API voor deze functionaliteit overbodig en te traag is.

Er zijn nog veel meer keuzes die ik bewust of onbewust heb gemaakt tijdens het ontwikkelen. Dit zijn de belangrijkste afwegingen, maar waarschijnlijk mis ik een hoop. Ik licht tijdens het assessment graag toe wat ik hier heb gemist.

# AI-gebruik
Tijdens dit project heb ik gebruik gemaakt van Claude Code. Om nieuwe functionaliteit te ontwikkelen, beschrijf ik eerst zo gedetailleerd mogelijk aan Claude wat ik wil. Ik laat Claude dan de code schrijven en controleer vervolgens of het voldoet aan wat ik exact wil. Zo niet, dan pas ik zelf de code aan waar nodig, of ik geef Claude meer details die ik eerder vergeten was te benoemen. Ik laat Claude dus de bulk van het werk doen en controleer zelf op detailniveau of alles correct is.

Zo heb ik Claude bijvoorbeeld eerst de opzet laten maken voor het scorebord met de inputvelden. Vervolgens wilde ik niet dat een speler een ongeldige score zou invullen, dus heb ik een lijst gemaakt met onmogelijke scores die niet kunnen worden ingevuld. Claude maakt dus het grootste deel en ik zorg voor de details.

# Mijn blik achteraf
Als ik meer tijd zou hebben, zou ik zorgen voor een mooiere UI. De interface is nu functioneel opgezet met Tailwind, maar visueel verfijnen had geen prioriteit. Ik weet dat een nette interface minstens zo belangrijk is voor de ervaring van de gebruiker als de functionaliteit van het product.

Verder had ik ook graag de mogelijkheid toegevoegd om met meer dan 2 spelers te spelen. Ik zou dan in het setupscherm een knop "add player" of "remove player" toevoegen, zodat je met meer spelers kunt spelen.

Iets waar ik niet helemaal tevreden mee ben is de inputvalidatie. Momenteel gebeurt er helemaal niets als je bijvoorbeeld al een 5 hebt getypt en daarna een 9 wilt typen om 59 in te voeren (een onmogelijke score). Dit is efficiënt, maar voor de gebruiker misschien onduidelijk. Ook zou een speler bijvoorbeeld kunnen uitgooien met 2 pijlen, een derde invoeren en daarmee busten. Hoewel dit onrealistisch is, aangezien je kunt uitgaan van correcte invoer, vind ik het fijn om dit soort gevallen te voorkomen.

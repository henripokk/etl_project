# Liikusõnnetuste andmete näidikute tahvel

## 1. Sissejuhatus
Dashboardi eesmärgiks on anda ülevaade Eesti liiklusõnnetustest aastatel 2011-2022, nende osalistest, liiklusoludest ja tingimustest õnnetuste toimumise htekel. Dashboard kasutab sisendina avalikult kättesaadavat liiklusõnnetuste andmestiku avaandmete lehelt ja ilmastiku andmestiku ilmateenistuse kodulehelt. Loodud dashboard on dünaamiline, mis tähendab, et kasutajal on võimalus valiku nuppude abil ehitada üles enda vajadustele vastav päring. 


## 2. dashboardi kasutamine

### 2.1 Eeldused süsteemile
Dashboardi kasutamiseks on vajalik Phytoni keskkonna kasutamine. Vajalik on alljärgnevad Pythoni paketid ja nende versioonid:

* pandas==2.0.1
* numpy==1.23.1
* seaborn==0.12.1
* geopandas==0.13.0
* matplotlib==3.6.2
* plotly==5.10.0
* holoviews==1.15.3
* numexpr==2.8.4
* panel==0.14.2
* bokeh==2.4.3
* pyproj==3.4.0
* shapely==2.0.1
* folium==0.12.1.post1

### 2.2 dashboardi andmed

Andmed tuleb laadida lehelt: https://avaandmed.eesti.ee/datasets/inimkannatanutega-liiklusonnetuste-andmed ja alla tuleb laadida andmetik nimega "Liiklusõnnetused_2011_2021.csv töödeldud". Konreetne fail tuleb ümber nimetada data.csv, mida kasutatakse esimese pythoni programmikoodi failis nimega alguse_asi.ipynb. Selle programmi läbitöötamise tulemusena parandatakse ja puhastatakse andmeid, samuti liidetakse juurde neljast ilmajaamast päris temperatuuri andmed. Antud programmi tulemusena valmib uus csv fail nimega df_cleaned. Viimast kasutatakse dashboard.ipynb failis. 

Dashboardi kasutamiseks tuleb githubi keskkonnast projektiga seotud failid ning alla laetud andmefail paigutada ühte kataloogi ja failid tööle panna õiges järjekorras.


### 2.3 Andmete puhastamine ja korrastamine
Esimesena tuleb käima panna alguse_asi.ipynb, mis eeldab, et data.csv on failiga samas kataloogis. Antud faili eesmärk on avada liiklusõnnetuste andmestik, see puhastada ja korrastada. Andmetele liideti imateenistuse ilmaolude andmed. Peamised tegevused:

* andmete sisselugemine data.csv failist ning ilma andmete allalaadimine
* Koordinaadid olid esitatud EPSG:3301 süsteemis, mis tuli ümber teisendada geograafilisteks (EPSG:4326). 
* Mõningad liiklusõnnetuste asukohad olid väljaspool Eestis, näiteks Lätis, Tiibetis ja Aafrikas. Need eemaldasime edasisest andmeanalüüsist. 
* Samuti tuli piirkiiruse veeru andmeid korrastada, sest seal esines mittetäisarvulisi väärtusi.
* Andmetüüpide parandused - kuupäevad datetime, numbrid numnriteks, kategooriad kategooriateks jne 
* Salvestati fail df_clean.csv mida kasutati edaspidi dashboardi koostamisel

### 2.4 Dashboardi laadimine
Dashboardi laadimise eeldus on see on on teostatud edukalt andmete puhastamise ja korrastamise samm mille käigus on loodud df_clean.csv fail. dashboardi laadimiseks tuleb käima panna dashboard.ipynb fail mis peab asuma df_clean.csv failiga samas kataloogis. Peamised tegevused antud etapis:

* andmete laadimine df_clean failist
* erinevate nuppude ja liugurite valmistamine, mis toimivad filtrina andmestikule
* funktsioon, mis võtab nuppudelt ja liuguritelt väärtused ja selle alusel filtreerib andmestikust parameetritele vastavad andmed
* kaardi ja erinevate jooniste valmistamine. Iga joonis ja kaart on omaette funktsioon, mis võtab sisendiks andmed funktsioonist ning erinevate nuppude ja liuguri väärtusi
* Dünaamilise dashbordi kokkupanemine nuppudest ja liugurtest. Dashboard võtab sisendiks andmete ja nuppude, liuguri ja jooniste funktsioonid


### 2.5 Dashboardi kasutamine
Dashboard on dünaamiline ja selle erinevaid nuppe ja liugurit kasutades on võimalik valida soovitud ajaperiood mille kohta statistikat soovitakse teada. Lisaks on võimalik nuppude abil välja filtreerida soovitud liiklusõnnetuse osapooled. Jooniste nuppude abil saab valida millist statistikat antud liiklusõnnetuste kohta teada saada soovitakse. On võimalik vaadata andmeid liiklusõnnetuste arvust erinevatel perioodidel, liiklusõnnetuste osaliste jaotust, liiklusolude ja liiklustingimuste andmeid liiklusõnnetuse hetkel.

## Projekti käik

* Siia hakkavad tulema kuupäevad ja see mis on tehtud

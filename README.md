# Liikusõnnetuste andmete näidikute tahvel

## 1. Sissejuhatus
Meie grupp tegi projekti Eesti liiklusõnnetustest aastatel 2011-2022. Lisaks liiklusõnnetuste andmetele kasutasime ilmajaama andmeid ja liitsime kogu andmetikule juurde temperatuuri väärtused. Meie projekti eesmärgiks on anda ülevaade liiklusõnnetuste statistikast Eestis aastatel 2011-2022. Meie loodud töölaud (dashboard) on dünaamiline, mis tähendab, et kasutajal on võimalus valiku nuppude abil ehitada üles enda vajadustele vastav päring. 


## 2. dashboardi kasutamine

### 2.1 Eeldused süsteemile
Vajalik on alljärgnevad Pythoni paketid ja nende versioonid:
pandas==2.0.1
numpy==1.23.1
seaborn==0.12.1
geopandas==0.13.0
matplotlib==3.6.2
plotly==5.10.0
holoviews==1.15.3
numexpr==2.8.4
panel==0.14.2
bokeh==2.4.3
pyproj==3.4.0
shapely==2.0.1
folium==0.12.1.post1

### 2.2 dashboardi andmed

Andmed tuleb laadida lehelt: https://avaandmed.eesti.ee/datasets/inimkannatanutega-liiklusonnetuste-andmed ja alla tuleb laadida andmetik nimega "Liiklusõnnetused_2011_2021.csv töödeldud". Konreetne fail tuleb ümber nimetada data.csv, mida kasutatakse esimese pythoni programmikoodi failis nimega alguse_asi.ipynb. Selle programmi läbitöötamise tulemusena parandatakse ja puhastatakse andmeid, samuti liidetakse juurde neljast ilmajaamast päris temperatuuri andmed. Antud programmi tulemusena valmib uus csv fail nimega df_cleaned. Seda faili kasutatakse dashboard.ipynb programmis. 


### 2.3 Andmete puhastamine ja korrastamine
Koordinaadid olid esitatud EPSG:3301 süsteemis, mis tuli ümber teisendada geograafilisteks (EPSG:4326). Mõningad liiklusõnnetuste asukohad olid väljaspool Eestis, näiteks Lätis, Tiibetis ja Aafrikas. Need eemaldasime edasisest andmeanalüüsist. Samuti tuli piirkiiruse veeru andmeid korrastada, sest seal esines mittetäisarvulisi väärtusi. Andmete puhastamise tegime Python notebookis. Edasine töö käis puhastatud andmetega.

### 2.4 Dashboardi laadimine


### 2.5 Dashboardi täiendamine, UX osa muutmine
Dashboardi täiendasime viimasel nädalal, kui eemaldasime joonstelt ja tabelitelt automaatselt sinna lisatud sinise tausta. Jätsime alles alusjoonestiku, mille abil on võimalik paremini tulpade väärtusi näha. Ühe tulpdiagrammi asendasime joondiagrammiga ja muutsime osade andmete paigutust. Kasutasime Figma programmi, et luua UX disainidokument, mille abil visualiseerida paremini dashboardil esitatud tulemused. 

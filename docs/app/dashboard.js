importScripts("https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js");

function sendPatch(patch, buffers, msg_id) {
  self.postMessage({
    type: 'patch',
    patch: patch,
    buffers: buffers
  })
}

async function startApplication() {
  console.log("Loading pyodide!");
  self.postMessage({type: 'status', msg: 'Loading pyodide'})
  self.pyodide = await loadPyodide();
  self.pyodide.globals.set("sendPatch", sendPatch);
  console.log("Loaded!");
  await self.pyodide.loadPackage("micropip");
  const env_spec = ['https://cdn.holoviz.org/panel/0.14.2/dist/wheels/bokeh-2.4.3-py3-none-any.whl', 'https://cdn.holoviz.org/panel/0.14.2/dist/wheels/panel-0.14.2-py3-none-any.whl', 'pyodide-http==0.1.0', 'geopandas', 'holoviews>=1.15.1', 'matplotlib', 'numexpr', 'numpy', 'pandas', 'plotly', 'seaborn']
  for (const pkg of env_spec) {
    let pkg_name;
    if (pkg.endsWith('.whl')) {
      pkg_name = pkg.split('/').slice(-1)[0].split('-')[0]
    } else {
      pkg_name = pkg
    }
    self.postMessage({type: 'status', msg: `Installing ${pkg_name}`})
    try {
      await self.pyodide.runPythonAsync(`
        import micropip
        await micropip.install('${pkg}');
      `);
    } catch(e) {
      console.log(e)
      self.postMessage({
	type: 'status',
	msg: `Error while installing ${pkg_name}`
      });
    }
  }
  console.log("Packages loaded!");
  self.postMessage({type: 'status', msg: 'Executing code'})
  const code = `
  
import asyncio

from panel.io.pyodide import init_doc, write_doc

init_doc()

#!/usr/bin/env python
# coding: utf-8

# In[1]:


import pandas as pd
import numpy as np
import datetime as dt # for date data type
import seaborn as sns # For creating plots
import geopandas as gdp
import matplotlib.pyplot as plt
import plotly.express as px
import holoviews as hv
import datetime
import numexpr
from platform import python_version

import panel as pn

pn.extension()
pn.extension('plotly')


# In[ ]:





# In[2]:


df= pd.read_csv("df_clean.csv", parse_dates=['datetime']).set_index("datetime").sort_index()
df.head(5)


# In[3]:


# Make suitable df for dashboard

df['year'] = df.index.year.astype('category')
df['month'] = df.index.month.astype('category')
df['day_of_week'] = df.index.day_name().astype('category')
df['hour_of_day'] = np.where(df.index.time != datetime.time(0, 0), df.index.hour.astype('category'), np.nan)
df['Liiklusõnnetuse liik [3]']=df['Liiklusõnnetuse liik [3]'].astype('category')
df['Lubatud sõidukiirus (PPA)']=df['Lubatud sõidukiirus (PPA)'].astype('category')


# In[4]:


df.columns


# ## Siia kogun nupud

# In[5]:


min = pd.to_datetime(df.index.min())
max =pd.to_datetime(df.index.max())

# Slider kaardile aja perioodi muutmiseks
slider = pn.widgets.DateRangeSlider(
    name='Ajavahemik',
    start=min, end=max,
    value=(min, max),
    step=10000
)

#datetime_range_slider


# In[6]:


# valikunupud perioodi joonistele

perioodid = pn.widgets.RadioButtonGroup(
    name='Periood', options=['Aastad', 'Kuud', 'Päevad', 'Tunnid'], button_type='default')

perioodid


# In[7]:


# valikunupud õnnetuste joonistele

õnnetused = pn.widgets.RadioButtonGroup(
    name='Õnnetused', options=['Osalejad', 'Õnnetuse liik'], button_type='default')

õnnetused


# In[8]:


# valikunupud liiklusolude joonistele

olukord = pn.widgets.RadioButtonGroup(
    name='Liiklusolukord', options=['Tee element', 'Tee objekt', 'Kurvilisus', 'Tee tasasus', 'Tee seisund', 'Teekate', 'Piirkiirus'], button_type='default')

olukord


# In[9]:


# multiselect widget for participant type
# pole kasutusel
options=['Jalakäija osalusel', 'Kergliikurijuhi osalusel', 'Kaassõitja osalusel', 'Maastikusõiduki juhi osalusel', "Eaka (65+) mootorsõidukijuhi osalusel",  "Bussijuhi osalusel", "Veoautojuhi osalusel", "Ühissõidukijuhi osalusel", "Sõiduautojuhi osalusel", "Mootorratturi osalusel", "Mopeedijuhi osalusel", "Jalgratturi osalusel", "Alaealise osalusel", "Turvavarustust mitte kasutanud isiku osalusel", "Esmase juhiloa omaniku osalusel", "Mootorsõidukijuhi osalusel"]


multi_choice = pn.widgets.MultiChoice(name='Liiklusõnnetuse osalised', value=options,
    options=options, height=260, width=600)

multi_choice


# In[10]:


# ilmastiku jooniste nupud
ilmastik = pn.widgets.RadioButtonGroup(
    name='Ilmastiku seisund', options=['Ilmaolud', 'Valge aeg', 'Valgustus', 'Temperatuur', 'Teekatte seisund'], button_type='default')

ilmastik


# In[11]:


ilmastik.value


# In[12]:


df[multi_choice.value].sum(axis=1)>0


# ## vaatan kas saab andmed paremini esitatud

# In[13]:


def data(slider_value, multi_choice_value):
    df_kaart=df.loc[pd.to_datetime(slider_value[0]):pd.to_datetime(slider_value[1])]
    df_kaart = df_kaart.loc[df_kaart[multi_choice_value].sum(axis=1)>0 ]
    return df_kaart

data(slider.value, multi_choice.value)[multi_choice.value]


# In[14]:


# suured numbrid - hukkunud, vigastatud ja õnnetusi
@pn.depends( pn.widgets.DateRangeSlider.param.value_throttled)
@pn.depends( pn.widgets.MultiChoice.param.value)
def statistika(slider_value, multi_choice_value, veerg):
    if veerg=="Õnnetusi":
        return pn.indicators.Number(name=veerg, value=data(slider_value, multi_choice_value)['Juhtumi nr'].count(), font_size = "36pt", width=150)  
    else:
        return pn.indicators.Number(name=veerg, value=data(slider_value, multi_choice_value)[veerg].sum(), font_size = "36pt", width=150)

pn.Row(statistika(slider.value, multi_choice.value, 'Õnnetusi'),statistika(slider.value, multi_choice.value, 'Õnnetusi'))



# ## Siin teen joonised

# In[15]:


# liiklusõnnetused liiklusolude kaupa kaupa
@pn.depends( pn.widgets.RadioButtonGroup.param.value)   
def ilmastik_joonis(liik, multi_choice_value, slider_value):
    df_kaart=data(slider_value, multi_choice_value)    
    

    # Counting the number of accidents for each time component
    Ilmaolud = df_kaart["Ilmastik [1]"].value_counts().sort_index().sort_values()
    Valge= df_kaart["Valgustus [1]"].value_counts().sort_index().sort_values()
    Valgustus = df_kaart["Valgustus [2]"].value_counts().sort_index().sort_values()
    Temperatuur = df_kaart["Temperature"].value_counts().sort_index().sort_values()
    Teekate = df_kaart["Teekatte seisund [2]"].value_counts().sort_index().sort_values()
    
# Creating bar plots using Plotly
    if liik == "Ilmaolud":
        fig = px.bar(y=Ilmaolud.index, x=Ilmaolud.values, labels={'x': 'Õnnetuste arv'}, title='Õnnetuste arv erinevatelilmastiku olukordades')
    elif liik == "Valge aeg": 
        fig = px.bar(y=Valge.index, x=Valge.values, labels={'x': 'Õnnetuste arv'}, title='Õnnetuste arv valgel ja pimedal ajal')
    elif liik == "Valgustus": 
        fig = px.bar(y=Valgustus.index, x=Valgustus.values, labels={'x': 'Õnnetuste arv'}, title='Õnnetuste arv erineva valgustuse korral')
    elif liik == "Temperatuur": 
        fig = px.histogram(df_kaart, x="Temperature", labels={'x': 'Õnnetuste arv'}, title='Õnnetuste arv erinevate  temperatuuri korral')
    elif liik == "Teekatte seisund": 
        fig = px.bar(y=Teekate.index, x=Teekate.values, labels={'x': 'Õnnetuste arv'}, title='Õnnetuste arv erineva teekatte seisundiga teedel') 
    return fig

ilmastik_joonis(ilmastik.value, multi_choice.value, slider.value)


# In[16]:


# liiklusõnnetused liiklusolude kaupa kaupa
@pn.depends( pn.widgets.RadioButtonGroup.param.value)   
def liiklusolud(liik, multi_choice_value, slider_value):
    df_kaart=data(slider_value, multi_choice_value)    
    

    # Counting the number of accidents for each time component
    element = df_kaart['Tee element [2]'].value_counts().sort_index().sort_values()
    objekt = df_kaart['Tee objekt [2]'].value_counts().sort_index().sort_values()
    kurvilisus = df_kaart['Kurvilisus'].value_counts().sort_index().sort_values()
    tasasus = df_kaart['Tee tasasus'].value_counts().sort_index().sort_values()
    seisund = df_kaart['Tee seisund'].value_counts().sort_index().sort_values()
    teekate = df_kaart['Teekate'].value_counts().sort_index().sort_values()
    teekatte_seisund = df_kaart['Teekatte seisund [2]'].value_counts().sort_index().sort_values()
    piirkiirus = df_kaart['Lubatud sõidukiirus (PPA)'].value_counts().sort_index().sort_values()


    
# Creating bar plots using Plotly
    if liik == "Tee element":
        fig = px.bar(y=element.index, x=element.values, labels={'x': 'Õnnetuste arv'}, title='Õnnetuste arv erinevatel tee elementidel')
    elif liik == "Tee objekt": 
        fig = px.bar(y=objekt.index, x=objekt.values, labels={'x': 'Õnnetuste arv'}, title='Õnnetuste arv erinevatel tee objektidel')
    elif liik == "Kurvilisus": 
        fig = px.bar(y=kurvilisus.index, x=kurvilisus.values, labels={'x': 'Õnnetuste arv'}, title='Õnnetuste arv erineva kurvilisusega teedel')
    elif liik == "Tee tasasus": 
        fig = px.bar(y=tasasus.index, x=tasasus.values, labels={'x': 'Õnnetuste arv'}, title='Õnnetuste arv erinevate  tasasutega teedel')
    elif liik == "Tee seisund": 
        fig = px.bar(y=seisund.index, x=seisund.values, labels={'x': 'Õnnetuste arv'}, title='Õnnetuste arv erineva seisundiga teedel')
    elif liik == "Teekate": 
        fig = px.bar(y=teekate.index, x=teekate.values, labels={'x': 'Õnnetuste arv'}, title='Õnnetuste arv erineva teekattega teedel')
    elif liik == "Teekatte seisund": 
        fig = px.bar(y=teekatte_seisund.index, x=teekatte_seisund.values, labels={'x': 'Õnnetuste arv'}, title='Õnnetuste arv erineva teekatte seisundiga teedel')
    elif liik == "Piirkiirus": 
        fig = px.bar(y=piirkiirus.index, x=piirkiirus.values, labels={'x': 'Õnnetuste arv'}, title='Õnnetuste arv erineva piirkiirusega teedel')
        
        
    return fig

liiklusolud(olukord.value, multi_choice.value, slider.value)


# In[17]:


# liiklusõnnetused osaleja tüüpide kaupa
@pn.depends( pn.widgets.RadioButtonGroup.param.value)   
def osalejad(liik, multi_choice_value, slider_value):
    df_kaart=data(slider_value, multi_choice_value)  
    options=['Jalakäija osalusel', 'Kergliikurijuhi osalusel', 'Kaassõitja osalusel', 'Maastikusõiduki juhi osalusel', "Eaka (65+) mootorsõidukijuhi osalusel",  "Bussijuhi osalusel", "Veoautojuhi osalusel", "Ühissõidukijuhi osalusel", "Sõiduautojuhi osalusel", "Mootorratturi osalusel", "Mopeedijuhi osalusel", "Jalgratturi osalusel", "Alaealise osalusel", "Turvavarustust mitte kasutanud isiku osalusel", "Esmase juhiloa omaniku osalusel", "Mootorsõidukijuhi osalusel"]

    # Count the number of accidents for each participant type
    df_count = df_kaart[options].apply(pd.Series.value_counts).T.reset_index().sort_values(1.0)
    # Counting the number of accidents for each time component
    õnnetusi = df_kaart['Liiklusõnnetuse liik [3]'].value_counts().sort_index().sort_values()


    # Create the plot using Plotly Express
    fig1 = px.bar(df_count, y='index', x=1.0, title='Õnnetustes osalejate arv')
    fig1.update_layout(
    xaxis_title='Kokku',
    yaxis_title='')
    
# Creating bar plots using Plotly
    if liik == "Osalejad":
        return fig1
    elif liik == "Õnnetuse liik": 
        fig = px.bar(y=õnnetusi.index, x=õnnetusi.values, labels={'x': 'Õnnetuste arv'}, title='Erinevat liiki õnnetuste arv')
        return fig

osalejad(õnnetused.value, multi_choice.value, slider.value)


# In[18]:


# õnnetuste liigid

@pn.depends( pn.widgets.DateRangeSlider.param.value_throttled)
def onnetused_joonis(slider_value, multi_choice_value):
    df_kaart=data(slider_value, multi_choice_value)
    
    # Counting the number of accidents for each time component
    õnnetusi = df_kaart['Liiklusõnnetuse liik [3]'].value_counts().sort_index().sort_values()


    # Creating bar plots using Plotly
    fig = px.bar(y=õnnetusi.index, x=õnnetusi.values, labels={'y': 'Õnnetuse liik','x': 'Õnnetuste arv'}, title='Erinevat liiki õnnetuste arv')
    
    return fig

onnetused_joonis(slider.value, multi_choice.value)


# In[19]:


# Extracting year, month, day of week, and hour of day from the 'time_of_accident' column

#@pn.depends( pn.widgets.Button.param.button_type.objects)
@pn.depends( pn.widgets.RadioButtonGroup.param.value)
def perioodid_joonis(perioodid, slider_value, multi_choice_value):
    df_kaart=data(slider_value, multi_choice_value)
    
    # Counting the number of accidents for each time component
    Aastad = df_kaart['year'].value_counts().sort_index()
    Kuud = df_kaart['month'].value_counts().sort_index()
    Päevad = df_kaart['day_of_week'].value_counts().sort_index()
    Tunnid =df_kaart['hour_of_day'].value_counts().sort_index()

    # Creating bar plots using Plotly
    if perioodid == "Aastad":
        fig = px.bar(x=Aastad.index, y=Aastad.values, labels={'x': 'Aasta', 'y': 'Õnnetuste arv'}, title='Õnnetusi aasta kaupa')
    elif perioodid == "Kuud":
        fig = px.bar(x=Kuud.index, y=Kuud.values, labels={'x': 'Kuu','y': 'Õnnetuste arv'}, title='Õnnetusi kuude kaupa')
    elif perioodid == "Päevad":
        fig = px.bar(x=Päevad.index, y=Päevad.values, labels={'x': 'Nädalapäev','y': 'Õnnetuste arv'}, title='Õnnetusi päevade kaupa')
    elif perioodid == "Tunnid":
        fig = px.bar(x=Tunnid.index, y=Tunnid.values, labels={'x': 'Tund','y': 'Õnnetuste arv'}, title='Õnnetusi tundide kaupa')
    
    return fig

perioodid_joonis(perioodid.value, slider.value, multi_choice.value)


# In[ ]:





# In[20]:


df.info()


# In[21]:


# Kaart liiklusõnnetustega

@pn.depends( pn.widgets.DateRangeSlider.param.value_throttled)
def kaart(slider_value, multi_choice_value):
    df_kaart=data(slider.value, multi_choice.value)
    fig = px.scatter_mapbox(df_kaart, lat ="lat", lon="lon", height=600, zoom=6.5)
    fig.update_layout(mapbox_style="open-street-map")
    fig.update_layout(margin={"r":0,"t":0,"l":0,"b":0})
    #fig.show()
    
    return fig
#kaart(lider.value)


# In[22]:


# Function to display current year
@pn.depends( pn.widgets.DateRangeSlider.param.value_throttled)
def tiitel(slider):
    return '# Liiklusõnnetuste statistika ajavahemikul '


# ## Dashboard

# In[31]:


dashboard = pn.WidgetBox(pn.Row(
                             pn.Column(
                                 pn.Row(tiitel, slider),
                                 pn.Row(
                                     pn.bind(statistika, slider, multi_choice, 'Õnnetusi'),
                                     pn.bind(statistika, slider, multi_choice, 'Vigastatuid'),
                                     pn.bind(statistika, slider, multi_choice, 'Hukkunuid'), align=('center')),
                                 multi_choice,
                                 pn.Row(perioodid),
                                 pn.bind(perioodid_joonis, perioodid, slider, multi_choice), 
                                 align="start", sizing_mode='stretch_width'), 
                             pn.Column(
                                 pn.bind(kaart, slider, multi_choice),
                                 õnnetused,
                                 pn.bind(osalejad, õnnetused, multi_choice, slider)),
                            pn.Column(
                                olukord,
                                pn.bind(liiklusolud, olukord, multi_choice, slider),
                                ilmastik,
                                pn.bind(ilmastik_joonis, ilmastik, multi_choice, slider)
                             )
                        ))

dashboard.servable()


# In[ ]:






await write_doc()
  `

  try {
    const [docs_json, render_items, root_ids] = await self.pyodide.runPythonAsync(code)
    self.postMessage({
      type: 'render',
      docs_json: docs_json,
      render_items: render_items,
      root_ids: root_ids
    })
  } catch(e) {
    const traceback = `${e}`
    const tblines = traceback.split('\n')
    self.postMessage({
      type: 'status',
      msg: tblines[tblines.length-2]
    });
    throw e
  }
}

self.onmessage = async (event) => {
  const msg = event.data
  if (msg.type === 'rendered') {
    self.pyodide.runPythonAsync(`
    from panel.io.state import state
    from panel.io.pyodide import _link_docs_worker

    _link_docs_worker(state.curdoc, sendPatch, setter='js')
    `)
  } else if (msg.type === 'patch') {
    self.pyodide.runPythonAsync(`
    import json

    state.curdoc.apply_json_patch(json.loads('${msg.patch}'), setter='js')
    `)
    self.postMessage({type: 'idle'})
  } else if (msg.type === 'location') {
    self.pyodide.runPythonAsync(`
    import json
    from panel.io.state import state
    from panel.util import edit_readonly
    if state.location:
        loc_data = json.loads("""${msg.location}""")
        with edit_readonly(state.location):
            state.location.param.update({
                k: v for k, v in loc_data.items() if k in state.location.param
            })
    `)
  }
}

startApplication()
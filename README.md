# Night of Chances Support

Retrieve the missing client id and client secret from [https://console.developers.google.com/projectselector/apis/library?pli=1&supportedpurview=project](https://console.developers.google.com/projectselector/apis/library?pli=1&supportedpurview=project).

## Data structures

### Person
- first_name
- last_name
- telephone_number
- email_address
- attributes
 - name
 - value
- roles (Candidate, Buddy, Partner)

### Event
- name
- start_time
- end_time
- location
- attributes
 - name
 - value
- type (Workshop, Speed date, ...)
- partner **(?)**
- budy **(?)**

### Event requirement
- event **REL**
- person_attribute_name
- person_attribute_value
- value

## Values

### Person attribute
- name

## Use cases

### Import registracii z Eventbrite-u

### Import priradeni z JotForm-u

### Administracia partnerov
- Pridavanie
- Odstranenie
- Editacia
- Priradenie udalosti

### Administracia udalosti
- Pridanie
- Odstranenie
- Editacia

### Balik pre partnerov
- zoznam udalosti
- miestnosti
- mena buddy
- priradeni studenti
 - meno
 - priezvisko
 - email
 - je potvrdeny

### Balik pre buddikov
- zoznam udalosti
- miestnosti
- mena firiem
- priradeni studenti
 - meno
 - priezvisko
 - email
 - je potvrdeny
- mtz a kriteria pre udalosti

### Balik pre registracnu aplikaciu
- v podstate export co siel na Dusanovu apku

### Presentation for partner

### Email list of registered candidates for Exponea
csv containing email of each students and a list of workshops
- ti co sa dostali
- ti co sa nedostali
- ti co sa nikam nehlasili

### Pairing matrix
student vs registerable events (workshop, speed dates)
- is student interested
- is firm interested
- match rating (score)
- recomendation (auto)
- selection ()
- is confirmed ()
- attended

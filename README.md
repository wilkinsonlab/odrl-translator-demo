![](./screenshots/1.png)

![](./screenshots/2.png)

# Prerequisites

- Node.js v16.0.0 or higher
- PNPM or NPM or Yarn

# How to use

1. Go to the server folder and run the following commands:

```sh
pnpm install

# after installation, run:

pnpm run dev
```

2. Go to the frontend folder and run the following commands:

```sh
pnpm install

# after installation, run:

pnpm run dev
```

3. Now, you can visit [http://127.0.0.1:5173/](http://127.0.0.1:5173/) and test the ODRL Translator from the web interface. To test the ODRL Builder, go to [http://127.0.0.1:5173/policy_creator](http://127.0.0.1:5173/policy_creator).

- The ODRL translator API is located at http://localhost:3000 (or http://127.0.0.1:3000), but you don't have to visit this URL.

You can also use Docker to run run the server and the web interface in one go:

```sh
docker-compose up --build
```


<h3>Funding</h3>

<b>TED2021-130788B-I00</b>
<br />
Proyecto TED2021-130788B-I00 financed by
<br />
MCIN/AEI /10.13039/501100011033 and by the European Union Next Generation EU/ PRTR.
<br />
<img width="300" src="https://github.com/wilkinsonlab/FLAIR-GG/raw/main/VP/images/ted-logo.png" />
<br />
<br />
<br />
The FLAIR-GG computational infrastructure is supported by the
<br />"Severo Ochoa Program for Centres of Excellence in R&D 2022-2025" from the
Agencia Estatal de Investigación of Spain, awarded to the
<br />Center for Plant Biotechnology and Genomics (CBGP UPM-INIA/CSIC).
<br />
<br />
<br />
<br />
<b>Principal Investigators:</b>
<br />
<br />
Moreno Vazquez, Santiago<br />
UPM grupo: Biodiversidad y conservación de recursos fitogenéticos
<br /><br />
Wilkinson, Mark Denis <br />
CBGP UPM-INIA/CSIC. <br />
UPM grupo: Abordajes Multidisciplinares en la Interfaz Planta-Microorganismo<br />


# TODO

- [ ] Support for logical constraint translation.
- [ ] Ability to parse custom profiles.
- [ ] Support for multiple inputs (for example, a logical constraint is referenced by its URI in another graph).

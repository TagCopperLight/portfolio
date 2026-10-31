OrbitML corrige les prédictions d'orbite d'un satellite avec un petit réseau de neurones. À deux semaines, l'erreur de SGP4 (le modèle standard) passe de 1.9 km à 750 m. Le moteur de rendu Aurora est utilisé pour visualiser certaines étapes du projet.

![Orbite de Sentinel-6A autour du globe et sa trace au sol, rendues avec Aurora](/projects/orbitml/orbite.webp)

### Point de départ

OrbitML est né d'un manque sur mon CV : des stages de fin d'études qui m'intéressaient portaient sur le machine learning, et aucun de mes projets n'en faisait vraiment.

Je voulais aussi un sujet visuel, pour tirer parti d'Aurora. Ce sujet sur les satellites coche les deux cases, et deux articles de Peng et Bai[1][2] donnent un problème concret : prédire une orbite avec SGP4, puis apprendre à corriger son erreur.

### Choisir un satellite

Il faut d'abord un satellite dont la position exacte est publique (ou du moins connue bien plus précisément que l'erreur de SGP4). Les satellites européens Sentinel sont dans ce cas.

On commence par Sentinel-1A, le premier de la série, mais un problème apparaît rapidement : ce satellite a effectué des dizaines de manoeuvres en 2024. Le problème des manoeuvres, c'est qu'on ne peut pas les prédire. Il faut alors travailler autour, ce qui complique la tâche, et dégrade probablement la qualité des données.

On passe donc à Sentinel-6A : à 1336 km d'altitude, l'atmosphère est si ténue qu'elle le freine à peine, et il n'a manoeuvré que 4 fois dans l'année.

![Demi-grand axe de Sentinel-1A au fil de l'année 2024, avec ses manoeuvres](/projects/orbitml/manoeuvres.webp "Le demi-grand axe de Sentinel-1A en 2024, avec les 75 poussées les plus nettes.")

### La méthode

On ne reproduit aucun des deux articles. Celui de 2018[1] travaille sur des données simulées, une complexité qui n'apportait pas grand-chose ici. Celui de 2019[2] part de données réelles, mais utilise des SVM (Support Vector Machine), alors que mon but était de travailler sur des réseaux de neurones.

Le projet croise les deux : la méthode et les vraies données du second, le réseau du premier.

On mesure l'erreur dans trois directions : radiale (trop haut ou trop bas), le long de l'orbite (en avance ou en retard) et hors du plan (décalé sur le côté). Les pourcentages qui suivent sont la part de l'erreur de SGP4 qui reste après correction, sur 14 jours.

### Le surapprentissage

Les premiers modèles qu'on entraîne souffrent tous du même problème : le surapprentissage. C'est ce qui m'a le plus surpris. Je voyais les modèles comme des boîtes à qui on donne le plus de données possible et qui se débrouillent. Mais les modèles apprennent les données par coeur.

La solution passe par moins d'entrées (et des entrées réfléchies), une vraie validation et un entraînement arrêté au bon moment.

![Erreur restante le long de l'orbite, sur l'entraînement et sur le test](/projects/orbitml/surapprentissage.webp "L'erreur continue de baisser sur l'entraînement, mais remonte sur le test après quelques passages.")

Chaque entrée gardée vient d'une observation sur l'erreur. B\*, le coefficient de freinage du TLE, suit de près la dérive le long de l'orbite : un B\* trop grand freine trop le satellite dans SGP4. Ce qui reste ensuite oscille avec une période de 60 jours, celle de l'angle entre le plan de l'orbite et le Soleil : on l'ajoute aussi en entrée.

### La longitude

Mais même après tout ça, les modèles ne sont toujours pas très performants : il reste 63 % de l'erreur le long de l'orbite. Le réseau connaît la position du satellite dans un repère qui ne tourne pas avec la Terre, il ne peut donc pas savoir au-dessus de quel endroit il se trouve. Or SGP4 traite la Terre comme symétrique autour de son axe, alors que la gravité varie aussi d'une longitude à l'autre.

La carte ci-dessous le confirme : elle montre l'erreur en fonction de la position du satellite au-dessus de la Terre. On y voit que l'équateur n'est pas un cercle parfait : la Terre est légèrement ovale, d'où les deux lobes.

Ajouter la longitude en entrée du modèle fait passer l'erreur le long de l'orbite de 63 % à 39 %, et l'erreur radiale de 36 % à 13 %.

![Carte de l'erreur radiale moyennée par case de 3 degrés, en deux lobes opposés](/projects/orbitml/longitude.webp "L'erreur radiale moyenne, avant que le réseau sache où se trouve le satellite.")

### Résultats et limites

Le réseau final laisse 13 % de l'erreur radiale, 39 % le long de l'orbite et 18 % hors du plan sur 14 jours. On le réécrit ensuite avec PyTorch, que je voulais découvrir et qui m'a appris pas mal de choses : il retrouve les mêmes scores.

![Nuage des 96 TLE de test à 14 jours, étiré le long de l'orbite](/projects/orbitml/derive.webp "La dérive de SGP4 à 14 jours, à partir de 96 TLE gardés pour le test.")

![Le même nuage, avec les points corrigés en vert, resserrés](/projects/orbitml/correction.webp "Le même nuage après correction, en vert.")

Ces chiffres ont leurs limites : un seul satellite, une seule année… Des phénomènes physiques complexes tels que la pression de radiation solaire, ou cet équateur ovale (le terme C22), pourraient être approfondis.

D'autres satellites et d'autres années seraient la suite logique, mais ce serait davantage de l'orbitographie, alors que je voulais avant tout travailler sur les réseaux de neurones.

### Bibliographie

[1] H. Peng et X. Bai, *Artificial Neural Network–Based Machine Learning Approach to Improve Orbit Prediction Accuracy*, Journal of Spacecraft and Rockets, 55(5), 2018.

[2] H. Peng et X. Bai, *Machine Learning Approach to Improve Satellite Orbit Prediction Accuracy Using Publicly Available Data*, The Journal of the Astronautical Sciences, 2019.

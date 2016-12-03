Being project

Este proyecto es una estructura básica sobre la que poder desarrollar sistemas ubicuos y adaptativos. 
Cada elemento de estos sistemas de conocerá como "ser".
Servirá para conectar automaticamente todos los dispositivos en la red que utilicen este software
y hacer que estos intercambien información como identificadores, se podría intercambiar información en json
entre aplicaciones en diferentes dispositivos, se podría hacer una forma de proporcionar la ubicación en coordenadas del dispositivo(muy dificl de hacer).

El objetivo principal es crear una interfaz o estructura que permita comunicar dispositivos en una red de forma automatica.
Probablemente habría que hacer que los dispositivos buscasen por toda la red si hay mas "seres" como él y en caso afirmativo intercambiar información con ellos
para que se puedan mantener en contacto y cooperar , intercambiar información, etc
Finalmente se intentará hacer con una arquitectura semi distribuida, en la que habrá un servidor que pondrá en contacto a los seres. O quizas se 
permitan las dos formas de comunicación, en red local por broadcast o con un manager de seres.

Este software permitirá a los seres gestionar con mayor facilidad el contexto en el que se encuentran, se intentará en la medida de lo posible dar facilidades 
para gestionar e intercambiar con otros seres la información de contexto de las 5 W`s que, quien, cuando, donde y porque.

A grosso modo este software sería un servidor que:
- busca por toda la red si hay mas "seres" como el
- escucha en un determinado puerto para que otros "seres" se den a conocer
- cuando conoce a un nuevo ser se guarda su información (identificador, ip, ...)
- gestionará la vida de los seres que conozca, comprobando periodicamente si siguen vivos
- ofrecerá una api para interactuar con los seres que conozca

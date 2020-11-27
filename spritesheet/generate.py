from pysheeter import PySheeter # https://github.com/VictorWesterlund/pysheeter/

# Create spritesheets from folders
configurator = PySheeter.Sheet("configurator")
thumb = PySheeter.Sheet("thumbs")

configurator.put("../public/assets/img/sprites_872.png",(872,581))
thumb.put("../public/assets/img/sprites_128.png",(128,128))
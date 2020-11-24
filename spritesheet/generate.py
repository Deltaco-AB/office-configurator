import json
from pysheeter import PySheeter # https://github.com/VictorWesterlund/pysheeter/

folder = (
	"configurator/",
	"thumbs/",
	"../public/assets/img/" # Destination folder
)

# Initialize spritesheets
configurator = PySheeter.Sheet()
thumb = PySheeter.Sheet()

with open("../public/config.json","r") as f:
	data = json.load(f)

# Load images into spritesheets
for key in data["products"]:
	configurator.add(f"{folder[0]}{key}.png")
	thumb.add(f"{folder[1]}{key}.png")

# -----------

configurator.put(folder[2] + "sprites_c872.png",(872,581)) # Full-size
configurator.put(folder[2] + "sprites_c436.png",(436,240)) # Mobile

thumb.put(folder[2] + "sprites_t256.png",(256,256)) # Full-size
thumb.put(folder[2] + "sprites_t128.png",(128,128)) # Mobile
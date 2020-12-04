import json
import math
from pysheeter import PySheeter # https://github.com/VictorWesterlund/pysheeter/

folder = (
	"configurator/",
	"thumbs/",
	"../public/assets/img/sheets/" # Destination folder
)

sizes = 3 # No. of scaled sheets
confgSheet = (872,581) # Configurator sheet dimensions
thumbSheet = 256 # Thumbail sheet dimensions (width and height)

# Create new sheets
configurator = PySheeter.Sheet()
thumb = PySheeter.Sheet()

with open("../public/config.json","r") as f:
	data = json.load(f)

# Load images into sheets
for key in data["products"]:
	configurator.add(f"{folder[0]}{key}.png")
	thumb.add(f"{folder[1]}{key}.png")

# -----------

# Generate scaled sheets
# Example: configurator.put("../public/assets/img/sheets/c_512x512.png",(512,512))
for i in range(sizes):
	if(i == 0):
		# 1x (original) size
		configurator.put(f"{folder[2]}confg-1.0x.png",confgSheet)
		thumb.put(f"{folder[2]}thumb-1.0x.png",(thumbSheet,thumbSheet))
		continue
	
	# Scale dimensions
	factor = i * 1.5 # Limit factor
	confgSheetScaled = (
		math.floor(confgSheet[0] / factor),
		math.floor(confgSheet[1] / factor)
	)
	thumbSheetScaled = math.floor(thumbSheet / factor)

	screen = str(round(factor))

	configurator.put(f"{folder[2]}confg-0.{screen}x.png",confgSheetScaled)
	print(f"Scaled sheet: confg-0.{screen}x.png: {str(confgSheetScaled)}")

	thumb.put(f"{folder[2]}thumb-0.{screen}x.png",(thumbSheetScaled,thumbSheetScaled))
	print(f"Scaled sheet: thumb-0.{screen}x.png: {str(thumbSheetScaled)}")
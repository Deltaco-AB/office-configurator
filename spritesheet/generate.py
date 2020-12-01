import json
import math
from pysheeter import PySheeter # https://github.com/VictorWesterlund/pysheeter/

folder = (
	"configurator/",
	"thumbs/",
	"../public/assets/img/sheets/" # Destination folder
)

sizes = 3 # No. of scaled sheets
cSheetRect = (872,581) # Configurator sheet dimensions
tSheetSquare = 256 # Thumbail sheet dimensions (width and height)

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
		configurator.put(f"{folder[2]}c_{cSheetRect[0]}x{cSheetRect[1]}.png",cSheetRect)
		thumb.put(f"{folder[2]}t_{tSheetSquare}x{tSheetSquare}.png",(tSheetSquare,tSheetSquare))
		continue
	
	# Scale dimensions
	factor = i * 1.5 # Limit factor
	cSheetRectScaled = (
		math.floor(cSheetRect[0] / factor),
		math.floor(cSheetRect[1] / factor)
	)
	tSheetSquareScaled = math.floor(tSheetSquare / factor)

	configurator.put(f"{folder[2]}c_{cSheetRectScaled[0]}x{cSheetRectScaled[1]}.png",cSheetRectScaled)
	thumb.put(f"{folder[2]}t_{tSheetSquareScaled}x{tSheetSquareScaled}.png",(tSheetSquareScaled,tSheetSquareScaled))
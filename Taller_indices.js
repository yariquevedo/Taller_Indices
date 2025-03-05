//Taller .expression, creacr un mapa con le bounding box de bogotá 
//Calcular el NDVI 
//Calcular SAVI
//Calcular NDWI

// Cargar la colección de imágenes de Landsat 9
var collection = ee.ImageCollection("LANDSAT/LC09/C02/T1").filterDate('2024-01-01','2025-01-01').sort('CLOUD_COVER').first();

// Verificar que la colección contiene imágenes
if (collection) {
  var image = collection.clip(geometry); // Recortar la imagen al bounding box

  // Verificar que la imagen tiene bandas
  image.bandNames().size().evaluate(function(size) {
    if (size === 0) {
      print('⚠️ No se encontró una imagen válida. Intenta ajustar los filtros.');
    } else {
      // Definir las bandas necesarias para el cálculo de índices
      var bands = {
        NIR: image.select('B5'),  // Near Infrared (NIR) de Landsat 9
        RED: image.select('B4'),  // Red de Landsat 9
        SWIR: image.select('B6')  // Shortwave Infrared (SWIR) de Landsat 9
      };

      // Calcular los índices
      var ndvi = image.expression('(NIR - RED) / (NIR + RED)', bands).rename('NDVI');
      var savi = image.expression('((NIR - RED) / (NIR + RED + 0.5)) * 1.5', bands).rename('SAVI');
      var ndwi = image.expression('(NIR - SWIR) / (NIR + SWIR)', bands).rename('NDWI');

      // Añadir los índices como bandas
      var imageIndices = image.addBands([ndvi, savi, ndwi]);

      // Centrar el mapa en el área del polígono y visualizar las capas
      Map.centerObject(geometry, 10);
      Map.addLayer(imageIndices.select('NDVI'), {min: -1, max: 1, palette: ['blue', 'white', 'green']}, 'NDVI');
      Map.addLayer(imageIndices.select('SAVI'), {min: -1, max: 1, palette: ['yellow', 'orange', 'green']}, 'SAVI');
      Map.addLayer(imageIndices.select('NDWI'), {min: -1, max: 1, palette: ['red', 'white', 'blue']}, 'NDWI');
    }
  });
} else {
  print('⚠️ No se encontró una imagen en la colección. Revisa los filtros.');
}

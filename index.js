const sharp = require('sharp');
const fs = require('fs');

// Input file path (assuming _MG_9109.jpg is in the same folder as your script)
const inputFilePath = './1234.jpg';

// Output file path
const outputFilePath = './resized_image.webp'; // Change the file extension to .webp

// Maximum desired width
const maxWidth = 1200;

// Target file size in bytes (adjust this value as needed)
const targetFileSize = 100 * 1024; // 100 KB

// Load the input image
const image = sharp(inputFilePath);

// Get the original image dimensions
image.metadata()
  .then(metadata => {
    // Calculate the desired height while maintaining the aspect ratio
    const newHeight = Math.floor((maxWidth / metadata.width) * metadata.height);

    // Resize the image
    image.resize(maxWidth, newHeight);

    // Adjust the quality to achieve the target file size
    let quality = 100; // Initial quality value
    let attempts = 0;

    function optimizeImage() {
      image.webp({ quality: quality }) // Change to .webp() to output WebP format.

      // Get the buffer of the resized and compressed image
      image.toBuffer()
        .then(data => {
          // Check the file size
          const currentFileSize = data.length;

          // If the current file size is greater than the target, reduce quality and try again
          if (currentFileSize > targetFileSize && quality > 1) {
            quality -= 5; // Adjust the quality (you can adjust this step size)
            attempts++;
            if (attempts < 15) {
              // Limit the number of optimization attempts to avoid an infinite loop
              optimizeImage(); // Recursively try again
            } else {
              console.log('Reached maximum optimization attempts.');
              fs.writeFileSync(outputFilePath, data); // Save the current result
            }
          } else {
            // Save the result to the output file
            fs.writeFileSync(outputFilePath, data);
            console.log('Image resized and optimized to target size.');
          }
        })
        .catch(err => {
          console.error('Error while resizing and optimizing:', err);
        });
    }

    // Start the optimization process
    optimizeImage();
  })
  .catch(err => {
    console.error('Error while getting image metadata:', err);
  });

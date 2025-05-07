/* ========================================
   Selecting DOM Elements
   ======================================== */
   const fileInput = document.querySelector('.file-input');
   const chooseImgBtn = document.querySelector('.choose-img');
   const saveImgBtn = document.querySelector('.save-img');
   const resetFilterBtn = document.querySelector('.reset-filter');
   const previewImg = document.querySelector('.preview-img img');
   const filterButtons = document.querySelectorAll('.filter button');
   const filterSlider = document.querySelector('#brightness-slider');
   const filterName = document.querySelector('.filter-info .name');
   const filterValue = document.querySelector('.filter-info .value');
   const rotateButtons = document.querySelectorAll('.rotate button');
   const uploadBgBtn = document.querySelector(".upload-background-to-photo");
   const removeBgBtn = document.querySelector('.click-to-remove-bg');
   
   /* ========================================
      API Key for Remove.bg (Replace with your own)
      ======================================== */
   const apiKey = 'yseGW5YvBTymcZhV6cV8r1oX'; 
   
   /* ========================================
      Default Filter and Transformation Values
      ======================================== */
   let brightness = 100, saturation = 100, inversion = 0, grayscale = 0;
   let rotate = 0, flipHorizontal = 1, flipVertical = 1;
   let bgImageUrl = '';
   
   /* ========================================
      Function to Apply Filters and Transformations
      ======================================== */
   const applyFilters = () => {
       previewImg.style.transform = `rotate(${rotate}deg) scale(${flipHorizontal}, ${flipVertical})`;
       previewImg.style.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
       previewImg.style.backgroundImage = bgImageUrl ? `url(${bgImageUrl})` : 'none';
       previewImg.style.backgroundSize = "cover";
       previewImg.style.backgroundPosition = "center";
   };
   
   /* ========================================
      Function to Load Selected Image
      ======================================== */
   const loadImage = (event) => {
       const file = event.target.files[0];
       if (!file) return;
       previewImg.src = URL.createObjectURL(file);
       document.querySelector('.container').classList.remove('disable');
   };
   
   /* ========================================
      Event Listeners
      ======================================== */
   
   // Handle image file input
   fileInput.addEventListener('change', loadImage);
   chooseImgBtn.addEventListener('click', () => fileInput.click());
   
   /* ========================================
      Filter Button Functionality
      ======================================== */
   filterButtons.forEach(button => {
       button.addEventListener('click', () => {
           document.querySelector('.filter .active')?.classList.remove('active');
           button.classList.add('active');
           filterName.innerText = button.innerText;
           filterSlider.max = 100;
           filterSlider.value = eval(button.id);
           filterValue.innerText = `${filterSlider.value}%`;
       });
   });
   
   /* ========================================
      Filter Slider Functionality
      ======================================== */
   filterSlider.addEventListener('input', () => {
       filterValue.innerText = `${filterSlider.value}%`;
       const selectedFilter = document.querySelector('.filter .active')?.id;
       if (selectedFilter) {
           eval(`${selectedFilter} = ${filterSlider.value}`);
           applyFilters();
       }
   });
   
   /* ========================================
      Rotation and Flip Functionality
      ======================================== */
   rotateButtons.forEach(button => {
       button.addEventListener('click', () => {
           switch (button.id) {
               case 'left':
                   rotate -= 90;
                   break;
               case 'right':
                   rotate += 90;
                   break;
               case 'horizontal':
                   flipHorizontal *= -1;
                   break;
               case 'vertical':
                   flipVertical *= -1;
                   break;
           }
           applyFilters();
       });
   });
   
   /* ========================================
      Reset Filters to Default
      ======================================== */
   resetFilterBtn.addEventListener('click', () => {
       brightness = saturation = 100;
       inversion = grayscale = 0;
       rotate = 0;
       flipHorizontal = flipVertical = 1;
       bgImageUrl = '';
       applyFilters();
   });
   
   /* ========================================
      Save Edited Image Functionality
      ======================================== */
   saveImgBtn.addEventListener('click', () => {
       const canvas = document.createElement('canvas');
       const ctx = canvas.getContext('2d');
   
       let bgImage = new Image();
       let photoImage = new Image();
       
       // Use the main photo's size for the canvas
       photoImage.src = previewImg.src;
       bgImage.src = bgImageUrl || previewImg.src;
   
       photoImage.onload = () => {
           canvas.width = photoImage.naturalWidth;
           canvas.height = photoImage.naturalHeight;
   
           bgImage.onload = () => {
               // Draw background image if it exists
               ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
               // Apply transformations
               ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
               ctx.translate(canvas.width / 2, canvas.height / 2);
               ctx.rotate(rotate * Math.PI / 180);
               ctx.scale(flipHorizontal, flipVertical);
   
               // Draw main photo
               ctx.drawImage(photoImage, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
   
               // Download image
               const link = document.createElement('a');
               link.download = 'edited-image.png';
               link.href = canvas.toDataURL();
               link.click();
           };
       };
   });
   
   /* ========================================
      Background Upload Functionality
      ======================================== */
   const bgInput = document.createElement("input");
   bgInput.type = "file";
   bgInput.accept = "image/*";
   bgInput.style.display = "none";
   document.body.appendChild(bgInput);
   
   uploadBgBtn.addEventListener("click", () => bgInput.click());
   
   bgInput.addEventListener("change", (event) => {
       const file = event.target.files[0];
       if (!file) return;
       bgImageUrl = URL.createObjectURL(file);
       applyFilters();
   });
   
   /* ========================================
      Remove Background Using Remove.bg API
      ======================================== */
   removeBgBtn.addEventListener('click', () => {
       if (!previewImg.src) return alert("Please upload an image first!");
   
       const imageFile = previewImg.src;
   
       fetch(imageFile) // Convert the image to a Blob first
       .then(response => response.blob())
       .then(blob => {
           const formData = new FormData();
           formData.append('image_file', blob);
           formData.append('size', 'auto');
   
           fetch('https://api.remove.bg/v1.0/removebg', {
               method: 'POST',
               headers: {
                   'X-Api-Key': apiKey
               },
               body: formData
           })
           .then(response => response.blob())
           .then(blob => {
               const imageUrl = URL.createObjectURL(blob);
               previewImg.src = imageUrl; // Show image with background removed
           })
           .catch(error => {
               console.error('Error:', error);
               alert('Error removing background. Please try again.');
           });
       })
       .catch(error => {
           console.error('Error:', error);
           alert('There was an issue uploading the image.');
       });
   });
   
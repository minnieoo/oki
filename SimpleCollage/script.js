document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('imageInput');
    const imageGrid = document.getElementById('imageGrid');
    const horizontalBtn = document.getElementById('horizontalBtn');
    const verticalBtn = document.getElementById('verticalBtn');
    const clearBtn = document.getElementById('clearBtn');
    const themeBtn = document.getElementById('themeBtn');
    const hideBtn = document.getElementById('hideBtn');
    const exportBtn = document.getElementById('exportBtn');
    const copyBtn = document.getElementById('copyBtn');
    const reverseBtn = document.getElementById('reverseBtn');
    const details = document.querySelector('.Details');
    const range = document.querySelector('.slider');
    const bgColorInputs = document.querySelectorAll('input[name="bgColor"]');
    const canvasBgColorInputs = document.querySelectorAll('input[name="canvasBgColor"]');
    const canvasBg = document.querySelectorAll('.canvas-bg-select input');
    const help = document.querySelector('#helpBtn');
    const roundedCorners = document.querySelector('input#borderRadius');
    const creds = document.querySelector('#creds');
    const columnsInput = document.getElementById('columns');
    const gapInput = document.getElementById('gapSize');



    columns();
    gap();

    function updateThemeButtonText(currentTheme) {
        if (currentTheme === 'dark') {
            themeBtn.innerHTML = 'Light <i class="fa-solid fa-lightbulb"></i>';
        } else {
            themeBtn.innerHTML = 'Dark <i class="fa-solid fa-moon"></i>';
        }
    }
    
    // remember theme choice
    const userTheme = localStorage.getItem('theme');
    if (userTheme) {
        document.body.classList.add(userTheme);
        updateThemeButtonText(userTheme);
    } else {
        document.body.classList.add('dark');
        updateThemeButtonText('dark');
    }
    
    const userRoundedCorner = localStorage.getItem('rounded');
    if (userRoundedCorner) {
        roundedCorners.checked = userRoundedCorner === 'true';
    }

    imageInput.addEventListener('change', function() {
        const files = imageInput.files;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                borderRadius(img);
                imageGrid.appendChild(img);
                attachHoverListeners(img);
                imageInput.value = ''; // allows for upload of same files again
            }
            reader.readAsDataURL(file);
        }
    });

    // ======== no longer needed with column custom input ======== //
    // horizontalBtn.addEventListener('click', function() {
    //     imageGrid.classList.remove('vertical');
    //     imageGrid.classList.add('horizontal');
    // });

    // verticalBtn.addEventListener('click', function() {
    //     imageGrid.classList.remove('horizontal');
    //     imageGrid.classList.add('vertical');
    // });

    clearBtn.addEventListener('click', function() {
        imageGrid.innerHTML = '';
    });

    themeBtn.addEventListener('click', function() {
        // Toggling between light and dark themes
        document.body.classList.toggle('light');
        document.body.classList.toggle('dark');

        // Store the user's theme selection
        const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);

        // Update the button text
        updateThemeButtonText(currentTheme);
    });


    hideBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        details.style.display = 'none';
        creds.style.display = 'none';

    });

    document.body.addEventListener('click', function(event) {
        if (details.style.display === 'none') {
            details.style.display = 'block';
            creds.style.display = 'block';
        }
    });

    // range.addEventListener('input', function() {
    //     let size = range.value + '%';
    //     imageGrid.style.width = size;
    //     imageGrid.style.height = size;
    // });

    function setGridBackgroundColor() {
        let selectedBgColor = 'light';
        bgColorInputs.forEach(input => {
            if (input.checked) {
                selectedBgColor = input.value;
            }
        });

        if (selectedBgColor === 'light') {
            imageGrid.style.backgroundColor = '#f0f0f0';
        } else {
            imageGrid.style.backgroundColor = '#1d1d1d';
        }
    }

    function getSelectedCanvasBgColor() {
        let selectedCanvasBgColor = 'transparent';
        canvasBgColorInputs.forEach(input => {
            if (input.checked) {
                selectedCanvasBgColor = input.value;
            }
        });
        return selectedCanvasBgColor === 'transparent' ? null : selectedCanvasBgColor;
    }

    exportBtn.addEventListener('click', function() {
        const originalBgColor = imageGrid.style.backgroundColor;
        const bgColor = getSelectedCanvasBgColor();
        imageGrid.style.backgroundColor = bgColor || 'transparent';

        domtoimage.toPng(imageGrid, { bgcolor: bgColor })
            .then(function (dataUrl) {
                imageGrid.style.backgroundColor = originalBgColor;

                let link = document.createElement('a');
                link.href = dataUrl;
                link.download = 'image-grid.png';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                $.notify("Image downloaded successfully!", "success");
            })
            .catch(function (error) {
                console.error('Error capturing image grid:', error);
            });
    });

    copyBtn.addEventListener('click', function() {
        const originalBgColor = imageGrid.style.backgroundColor;
        const bgColor = getSelectedCanvasBgColor();
        imageGrid.style.backgroundColor = bgColor || 'transparent';

        domtoimage.toBlob(imageGrid, { bgcolor: bgColor })
            .then(function (blob) {
                imageGrid.style.backgroundColor = originalBgColor;

                const item = new ClipboardItem({'image/png': blob});

                navigator.clipboard.write([item]).then(() => {
                    $.notify("Copied to clipboard!", "success");
                }).catch(err => {
                    $.notify("Failed to copy image: " + err, "error");
                });
            })
            .catch(function (error) {
                console.error('Error capturing image grid:', error);
            });
    });

    reverseBtn.addEventListener('click', function() {
        const images = Array.from(imageGrid.children);
        images.reverse().forEach(img => imageGrid.appendChild(img));
    });


    function borderRadius(img) {
        if (roundedCorners.checked) {
            img.style.borderRadius = '5px';
        } else {
            img.style.borderRadius = '0px';
        }
    }

    roundedCorners.addEventListener('change', function() {
        const images = document.querySelectorAll('#imageGrid img');
        localStorage.setItem('rounded', roundedCorners.checked);
        images.forEach((img) => {
            borderRadius(img);
        });
    });

    function columns() {
        let columns = `repeat(${columnsInput.value}, 1fr)`;
        imageGrid.style.setProperty('--columns', columns);
    }

    function gap() {
        let gap = `${gapInput.value}px`;
        imageGrid.style.setProperty('--gap', gap);
    }

    columnsInput.addEventListener('input', function() {
        let columns = `repeat(${columnsInput.value}, 1fr)`;
        imageGrid.style.setProperty('--columns', columns);
    });

    gapInput.addEventListener('input', function() {
        let gap = `${gapInput.value}px`;
        imageGrid.style.setProperty('--gap', gap);
    });


    // remove images
    function attachHoverListeners(img) {
        img.addEventListener('mouseenter', () => {
            img.classList.add('hovered');
        });

        img.addEventListener('mouseleave', () => {
            img.classList.remove('hovered');
        });

        img.addEventListener('click', ()=> {
            const confirmBtn = document.createElement('div');
            let imgSrc = img.src;
            confirmBtn.classList.add('confirm-btn-container');
            confirmBtn.innerHTML = `
                <div class="backdrop"></div>
                <div class="confirmBtnCont">
                    <p>Do you want to remove this image? <span class="alert">This cannot be undone.</span></p>
                    <img src="${imgSrc}" width="400px" height="auto">
                    <div class="actionBtns">
                        <button id="confirmBtn">CONFIRM</button>
                        <button id="cancelBtn">CANCEL</button>
                    </div>
                </div>
                
            `;
            confirmBtn.style.cssText = `
                z-index: 10000000;
                width: 100%;
                height: 100%;
            `;
            document.body.appendChild(confirmBtn);
            
            confirmBtn.addEventListener('click', (e)=> {
                if (e.target.id === 'confirmBtn') {
                    document.body.removeChild(confirmBtn);
                    img.remove();
                } else {
                    document.body.removeChild(confirmBtn);
                }
            });

            
        })
    }


    //  ------- tool tips -------- //
    tippy('.canvas-bg-select input', {
        content: 'Background color of copied/downloaded image (this will be added upon downloading/copying the collage, you won\'t see it displayed)',
    });

    tippy('#horizontalBtn', {
        content: 'Sort images horizontally (side by side)',
    });

    tippy('#verticalBtn', {
        content: 'Sort images vertically (up and down)',
    });

    tippy('#themeBtn', {
        content: 'Choose light or dark UI theme',
    });

    tippy('#clearBtn', {
        content: 'Remove all images',
    });

    tippy('.slider', {
        content: 'Resize collage',
    });

    tippy('input#borderRadius', {
        content: 'Give the images a rounded corner',
    });

    tippy('#hideBtn', {
        content: 'Hide the UI elements (click anywhere on screen to unhide)',
    });

    tippy('#gapSize', {
        content: 'Change the distance between images on the collage',
    });

    tippy('#columns', {
        content: 'Define the amount of columns you want on the collage, this will form a grid of images. The default is 2. If you want longer rows, increase this number',
    });

    tippy('#reverseBtn', {
        content: 'Reverse the order of the images',
    });

    tippy('#helpBtn', {
        content: 'This site allows you to add multiple images to quickly make a collage. Remove images by hovering and clicking. Click for more info and a video tutorial',
    });
});

var  executed = false;
            if(!executed){
            window.addEventListener('load', () => {
                executed = true;
                const preloader  = document.querySelector('.preload');
                preloader.classList.add('preload-finish');
                executed = true;
            });
        } else {
            preloader.classList.remove('.preload');
        }
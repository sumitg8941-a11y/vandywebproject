const flipbook = {
    modal: null,
    imageEl: null,
    pdfEl: null,
    prevBtn: null,
    nextBtn: null,
    titleEl: null,
    currentPageEl: null,
    totalPagesEl: null,
    
    pages: [],
    currentIndex: 0,
    
    startTime: 0,
    maxPageReached: 1,
    currentOfferId: null,

    init: function() {
        this.modal = document.getElementById('flipbook-modal');
        this.imageEl = document.getElementById('flipbook-image');
        this.pdfEl = document.getElementById('flipbook-pdf');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.titleEl = document.getElementById('flipbook-title');
        this.currentPageEl = document.getElementById('current-page');
        this.totalPagesEl = document.getElementById('total-pages');
        
        // Close modal when clicking on the dark background outside the content
        window.onclick = (event) => {
            if (event.target == this.modal) {
                this.close();
            }
        };
    },

    open: function(title, mainImage, pdfUrl, offerId) {
        if (!this.modal) this.init();
        
        this.startTime = Date.now(); // Start the stopwatch!
        this.maxPageReached = 1;
        this.currentOfferId = offerId;
        
        this.titleEl.innerText = title;
        
        if (pdfUrl && pdfUrl !== '#') {
            // Real PDF Mode: Hide image and custom navigation, show native PDF iframe
            this.imageEl.style.display = 'none';
            this.prevBtn.style.display = 'none';
            this.nextBtn.style.display = 'none';
            this.currentPageEl.parentElement.style.display = 'none';
            
            this.pdfEl.style.display = 'block';
            this.pdfEl.src = pdfUrl;
        } else {
            // Fallback Image Mode: Show simulated page flip for items without PDFs
            this.pdfEl.style.display = 'none';
            this.imageEl.style.display = 'block';
            this.prevBtn.style.display = 'block';
            this.nextBtn.style.display = 'block';
            this.currentPageEl.parentElement.style.display = 'block';
            
            this.pages = [ mainImage, mainImage, mainImage ];
            this.currentIndex = 0;
            this.updateView();
        }
        this.modal.style.display = 'flex';
    },

    close: function() {
        if(this.modal) {
            this.modal.style.display = 'none';
            if (this.pdfEl) this.pdfEl.src = ''; // Clear source to stop background loading
            
            // Calculate time spent and send analytics to backend
            if (this.currentOfferId) {
                const durationInSeconds = Math.floor((Date.now() - this.startTime) / 1000);
                api.trackOfferStats(this.currentOfferId, durationInSeconds, this.maxPageReached);
            }
            this.currentOfferId = null;
        }
    },

    next: function() {
        if (this.currentIndex < this.pages.length - 1) {
            this.currentIndex++;
            this.maxPageReached = Math.max(this.maxPageReached, this.currentIndex + 1);
            this.updateView();
        }
    },

    prev: function() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateView();
        }
    },

    updateView: function() {
        this.imageEl.src = this.pages[this.currentIndex];
        this.currentPageEl.innerText = this.currentIndex + 1;
        this.totalPagesEl.innerText = this.pages.length;
    }
};
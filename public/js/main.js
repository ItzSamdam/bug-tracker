/* Main.js - Client-side JavaScript */
document.addEventListener('DOMContentLoaded', function() {
        // Enable Bootstrap tooltips
        const tooltipTriggerList=[].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));

        tooltipTriggerList.map(function(tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });

        // Dashboard bug filtering functionality
        const filterStatus=document.getElementById('filter-status');
        const searchInput=document.getElementById('search-input');
        const bugCards=document.querySelectorAll('.bug-card');

        function filterBugs() {
            const statusValue=filterStatus ? filterStatus.value : 'all';
            const searchValue=searchInput ? searchInput.value.toLowerCase() : '';

            bugCards.forEach(card=> {
                    const status=card.getAttribute('data-status');
                    const searchText=card.getAttribute('data-search');

                    // Filter by status
                    const statusMatch=statusValue==='all' || status===statusValue;

                    // Filter by search term
                    const searchMatch= !searchValue || (searchText && searchText.includes(searchValue));

                    // Show/hide based on filters
                    if (statusMatch && searchMatch) {
                        card.style.display='';
                    }

                    else {
                        card.style.display='none';
                    }
                });
        }

        // Add event listeners for filtering
        if (filterStatus) {
            filterStatus.addEventListener('change', filterBugs);
        }

        if (searchInput) {
            searchInput.addEventListener('input', filterBugs);
        }

        // Close flash messages after 5 seconds
        const flashMessages=document.querySelectorAll('.alert');

        flashMessages.forEach(message=> {
                setTimeout(()=> {
                        const alert=new bootstrap.Alert(message);
                        alert.close();
                    }

                    , 5000);
            });

        // File input validation
        const fileInput=document.getElementById('image');

        if (fileInput) {
            fileInput.addEventListener('change', function() {
                    const fileSize=this.files[0].size / 1024 / 1024; // in MB

                    if (fileSize > 5) {
                        alert('File size exceeds 5 MB. Please choose a smaller file.');
                        this.value='';
                    }

                    const fileType=this.files[0].type;

                    if ( !fileType.match(/image\/(jpeg|jpg|png|gif)/)) {
                        alert('Please select a valid image file (JPEG, PNG, GIF).');
                        this.value='';
                    }
                });
        }

        // Image preview
        const imagePreview=document.getElementById('image-preview');

        if (fileInput && imagePreview) {
            fileInput.addEventListener('change', function() {
                    if (this.files && this.files[0]) {
                        const reader=new FileReader();

                        reader.onload=function(e) {
                            imagePreview.src=e.target.result;
                            imagePreview.style.display='block';
                        }

                        ;
                        reader.readAsDataURL(this.files[0]);
                    }
                });
        }
    });

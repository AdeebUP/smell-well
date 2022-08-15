function addToCart(proId) {
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {

                let count = $('#cart-count').data('notify')
                count = parseInt(count) + 1
                alert(count)
                $('#cart-count').data('notify', count)
            }
        }
    })
}
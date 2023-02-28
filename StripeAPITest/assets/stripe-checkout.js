import keys from "./stripe-keys.js";

let $products = document.querySelector("#products"),
template = document.querySelector("#product-template").content,
$fragment = document.createDocumentFragment(),
fetchOptions = {
    headers: {
        Authorization: `Bearer ${keys.secret}`
    }
};

let products, prices;

Promise.all([
    fetch('https://api.stripe.com/v1/products', fetchOptions),
    fetch('https://api.stripe.com/v1/prices', fetchOptions),
])
.then(responses => Promise.all(responses.map(res => res.json())))
.then(json => {
    products = json[0].data;
    prices = json[1].data;
    prices.forEach(el => {
        let productData = products.filter((product) => product.id === el.product);
        template.querySelector('.product').setAttribute('data-price', el.id);
        template.querySelector('img').setAttribute('src', productData[0].images[0]);
        template.querySelector('img').setAttribute('alt', productData[0].name);
        template.querySelector('figcaption').innerHTML = `${productData[0].name} <br> ${el.currency} $ ${el.unit_amount_decimal.slice(0, el.unit_amount_decimal.length-2)}.${el.unit_amount_decimal.slice(el.unit_amount_decimal.length-2, el.unit_amount_decimal.length)}`;
        template.querySelector('p').textContent = productData[0].description;


        let clone = document.importNode(template, true);
        $fragment.appendChild(clone);
    });
    $products.appendChild($fragment);


})
.catch((err) => {
    let msg = err.message || "Error message unavailable";
    $products.innerHTML = `<p>Error: ${msg}</p>`;
});

document.addEventListener('click', e => {
    if(e.target.matches(".product *")){
        let priceId = e.target.parentElement.getAttribute('data-price');
        Stripe(keys.public)
        .redirectToCheckout({
            lineItems:[{price: priceId, quantity: 1}],
            mode: "payment",
            successUrl: "http://127.0.0.1:5500/StripeAPITest/assets/stripe-success.html",
            cancelUrl: "http://127.0.0.1:5500/StripeAPITest/assets/stripe-cancel.html"
        })
        .then(res => {
            console.log(res);
            if(res.error) {
                console.log(error);
                $products.insertAdjacentHTML('afterend', res.error.message);
            }
        })
        
    };

});

/*    
//products
fetch('https://api.stripe.com/v1/products',{
    headers: {
        Authorization: `Bearer ${keys.secret}`
    }
})
.then(response => {
    console.log(response);
    console.log(response.json());
});

//prices
fetch('https://api.stripe.com/v1/prices',{
    headers: {
        Authorization: `Bearer ${keys.secret}`
    }
})
.then(response => {
    console.log(response);
    console.log(response.json());
});
*/


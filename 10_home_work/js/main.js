const API_URL = 'https://fakestoreapi.com/products';
let allProducts = []; 
let currentCategory = ''; 

async function getProducts() {
  try {
    const response = await fetch(API_URL); 
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }
    const products = await response.json();
    allProducts = products; 
    displayProducts(allProducts);
  } catch (error) {
    alert('Error fetching products: ' + error.message);
  }
}

function displayProducts(products) {
  const productList = document.getElementById('product-list');
  productList.innerHTML = ''; 

  products.forEach((product, index) => {
    const productElement = createProductElement(product, index);
    productList.appendChild(productElement);
  });
}

function createProductElement(product, index) {
  const productDiv = document.createElement('div');
  productDiv.classList.add('product');
  productDiv.innerHTML = `
    <img src="${product.image}" alt="${product.title}" style="width:100px; height:auto;">
    <h3>${product.title}</h3>
    <p>Цена: ${product.price}</p>
    <p>${product.description}</p>
    <button class="edit-btn" onclick="editProduct(${index})">Edit</button>
    <button class="delete-btn" onclick="deleteProduct(${index})">Delete</button>
  `;
  return productDiv;
}

function editProduct(index) {
  const product = { ...allProducts[index] }; 
  const newTitle = prompt('Введите новое название:', product.title);
  const newPrice = prompt('Введите новую цену:', product.price);
  const newDescription = prompt('Введите новое описание:', product.description);
  const newCategory = prompt('Введите новую категорию:', product.category);
  const newImage = prompt('Введите новый URL изображения:', product.image);

  if (newTitle !== null) product.title = newTitle;
  if (newPrice !== null) product.price = parseFloat(newPrice);
  if (newDescription !== null) product.description = newDescription;
  if (newCategory !== null) product.category = newCategory;
  if (newImage !== null) product.image = newImage;

  
  allProducts[index] = product;
  
  displayProducts(allProducts);

  updateProductOnServer(product, product.id);
}

async function updateProductOnServer(product, productId) {
  try {
    const response = await fetch(`${API_URL}/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error(`Failed to update product: ${response.status} ${response.statusText}`);
    }

    showMessage(`Product "${product.title}" updated successfully!`);
  } catch (error) {
    showMessage(`Error updating product: ${error.message}`, true);
  }
}

function deleteProduct(index) {
  if (confirm('Вы уверены, что хотите удалить этот товар?')) {
    allProducts.splice(index, 1); 
    displayProducts(allProducts); 
    showMessage('Product deleted successfully!');
  } else {
    showMessage('Product deletion was canceled.', true);
  }
}

async function handleEdit(event) {
  const productId = event.target.dataset.id;
  const product = allProducts.find(p => p.id == productId);
  
  if (!product) {
    showMessage('Product not found.', true);
    return;
  }
  
  
  document.getElementById('products_form').onsubmit = async (event) => {
    event.preventDefault();
    
    const updatedProduct = {
      title: document.getElementById('productName').value,
      description: document.getElementById('productDesc').value,
      image: document.getElementById('productImg').value,
      category: document.getElementById('productCtg').value,
      price: parseFloat(document.getElementById('productPrice').value),
    };
  }
  
  try {
    const response = await fetch(`${API_URL}/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product), 
    });

    if (!response.ok) {
      throw new Error(`Failed to update product: ${response.status} ${response.statusText}`);
    }
    
  } catch (error) {
    showMessage(`Error updating product: ${error.message}`, true);
  }
}
async function handleAddProduct(event) {
  event.preventDefault();

  const name = document.getElementById('productName').value;
  const description = document.getElementById('productDesc').value;
  const image = document.getElementById('productImg').value;
  const category = document.getElementById('productCtg').value;
  const price = parseFloat(document.getElementById('productPrice').value);

  const newProduct = {
    title: name,
    description: description,
    image: image,
    category: category,
    price: price,
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProduct),
    });

    if (!response.ok) {
      throw new Error(`Failed to add product: ${response.status} ${response.statusText}`);
    }

    const createdProduct = await response.json();
    allProducts.unshift(createdProduct);
    const productElement = createProductElement(createdProduct);
    const productList = document.getElementById('product-list');
    productList.insertBefore(productElement, productList.firstChild);
    showMessage(`Product "${name}" added successfully!`);

    document.getElementById('products_form').reset();
  } catch (error) {
    showMessage(`Error adding product: ${error.message}`, true);
  }
}

document.getElementById('products_form').addEventListener('submit', handleAddProduct);
getProducts(); 

const categories = document.getElementById('categories');
const categoriesOpen = document.getElementById('categoriesOpen');
const categoriesClose = document.getElementById('categoriesClose');

categories.addEventListener('click', () => {
  categoriesOpen.style.display = categoriesOpen.style.display === 'none' || categoriesOpen.style.display === '' ? 'block' : 'none';
});

categoriesClose.addEventListener('click', () => {
  categoriesOpen.style.display = 'none';
});


async function getCategories() {
  try {
    const response = await fetch('https://fakestoreapi.com/products/categories');
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }
    const categories = await response.json();
    displayCategories(categories);
  } catch (error) {
    alert('Error fetching categories: ' + error.message);
  }
}

function displayCategories(catList) {
  const ctg_list = document.getElementById('ctg_list');
  ctg_list.innerHTML = '';

  catList.forEach(category => {
    const categoryElement = document.createElement('p');
    categoryElement.className = 'ctg-item';
    categoryElement.textContent = category; 
    categoryElement.addEventListener('click', () => {
      currentCategory = category;
      
      const filteredProducts = allProducts.filter(product => product.category === currentCategory);
      displayProducts(filteredProducts);
    });
    ctg_list.appendChild(categoryElement);
  });
}

getCategories(); 

function showMessage(message, isError = false) {
  const messageContainer = document.getElementById('message-container');
  const messageElement = document.createElement('div');
  messageElement.className = `message ${isError ? 'error' : 'success'}`;
  messageElement.textContent = message;

  messageContainer.appendChild(messageElement);

  setTimeout(() => {
    messageContainer.removeChild(messageElement);
  }, 3000);
}
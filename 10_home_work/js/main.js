const API_URL = 'https://fakestoreapi.com/products';
let allProducts = [];
let currentCategory = '';
let productsPerPage = 6; 
let currentPage = 0; 

async function getProducts(page = 0) {
  try {
    const response = await fetch(`${API_URL}?limit=${productsPerPage}&page=${page + 1}`); 
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }
    const products = await response.json();
    allProducts = allProducts.concat(products); 
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
  const product = allProducts[index];

  
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

  
  displayProducts(allProducts);
}

function deleteProduct(index) {
  allProducts.splice(index, 1);
  displayProducts(allProducts); 
}



async function handleEdit(event) {
  const productId = event.target.dataset.id;
  const product = allProducts.find(p => p.id == productId);

  
  document.getElementById('productName').value = product.title;
  document.getElementById('productDesc').value = product.description;
  document.getElementById('productImg').value = product.image;
  document.getElementById('productCtg').value = product.category;
  document.getElementById('productPrice').value = product.price;

  
  document.getElementById('products_form').onsubmit = async (event) => {
    event.preventDefault();
    
    const updatedProduct = {
      title: document.getElementById('productName').value,
      description: document.getElementById('productDesc').value,
      image: document.getElementById('productImg').value,
      category: document.getElementById('productCtg').value,
      price: parseFloat(document.getElementById('productPrice').value),
    };

    try {
      const response = await fetch(`${API_URL}/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) {
        throw new Error(`Failed to update product: ${response.status} ${response.statusText}`);
      }

      const index = allProducts.findIndex(p => p.id == productId);
      allProducts[index] = await response.json(); 
      alert('Product updated successfully!');
      displayProducts(allProducts); 
    } catch (error) {
      alert(`Error updating product: ${error.message}`);
    }
    return false; 
  };
}

async function handleDelete(event) {
  const productId = event.target.dataset.id;
  const productElement = event.target.closest('.product');

  try {
    const response = await fetch(`${API_URL}/${productId}`, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.status} ${response.statusText}`);
    }

    productElement.remove();
    allProducts = allProducts.filter(product => product.id !== productId); 
    alert('Product deleted successfully!');
  } catch (error) {
    alert(`Error deleting product: ${error.message}`);
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
    alert(`Product "${name}" added successfully!`);

    document.getElementById('products_form').reset();
  } catch (error) {
    alert(`Error adding product: ${error.message}`);
  }
}

document.getElementById('products_form').addEventListener('submit', handleAddProduct);
getProducts(currentPage);

const categories = document.getElementById('categories');
const categoriesOpen = document.getElementById('categoriesOpen');
const categoriesClose = document.getElementById('categoriesClose');

categories.addEventListener('click', () => {
  categoriesOpen.style.display = categoriesOpen.style.display === 'none' || categoriesOpen.style.display === '' ? 'block' : 'none';
});

categoriesClose.addEventListener('click', () => {
  categoriesOpen.style.display = 'none';
});

// Загрузка дополнительных товаров
document.getElementById('more_products').addEventListener('click', () => {
  currentPage += 1; 
  getProducts(currentPage); 
});

// Фильтрация по категориям
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
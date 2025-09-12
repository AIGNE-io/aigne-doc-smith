<example>
下面是一些优质的文档详情供你参考：

<example_item>
  # Quick install guide

  Before you can use Django, you’ll need to get it installed. We have a complete installation guide that covers all the possibilities; this guide will guide you to a minimal installation that’ll work while you walk through the introduction.

  ## Install Python

  Being a Python web framework, Django requires Python. See What Python version can I use with Django? for details. Python includes a lightweight database called SQLite so you won’t need to set up a database just yet.

  Get the latest version of Python at [https://www.python.org/downloads/](https://www.python.org/downloads/) or with your operating system’s package manager.

  You can verify that Python is installed by typing `python` from your shell; you should see something like:

  ```
  Python 3.x.y
  [GCC 4.x] on linux
  Type "help", "copyright", "credits" or "license" for more information.
  >>>
  ```

  ## Set up a database

  This step is only necessary if you’d like to work with a “large” database engine like PostgreSQL, MariaDB, MySQL, or Oracle. To install such a database, consult the database installation information.

  ## Install Django

  You’ve got three options to install Django:

  1. Install an official release. This is the best approach for most users.
  2. Install a version of Django provided by your operating system distribution.
  3. Install the latest development version. This option is for enthusiasts who want the latest-and-greatest features and aren’t afraid of running brand new code. You might encounter new bugs in the development version, but reporting them helps the development of Django. Also, releases of third-party packages are less likely to be compatible with the development version than with the latest stable release.

  ## Verifying

  To verify that Django can be seen by Python, type `python` from your shell. Then at the Python prompt, try to import Django:

  ```python
  >>> import django
  >>> print(django.get_version())
  5.2
  ```

  You may have another version of Django installed.

  ## That’s it!

  That’s it – you can now move onto the tutorial.
</example_item>

<example_item>
  # Products

  Products are a fundamental resource in PaymentKit, representing the goods or services you offer. This section provides a comprehensive guide to managing your products using the PaymentKit Node.js SDK, including creating, retrieving, updating, listing, and deleting products.

  For information on defining pricing models for your products, refer to the [Prices](/core-resources/prices) section. To manage customer information, see [Customers](/core-resources/customers).

  ## Create a Product

  Use the `create` method to define a new product in your PaymentKit system. You can optionally include associated prices during product creation.

  **Parameters**

  <x-field data-name="name" data-type="string" data-required="true" data-desc="The name of the product."></x-field>

  <x-field data-name="description" data-type="string" data-required="false" data-desc="An optional description for the product."></x-field>

  <x-field data-name="type" data-type="string" data-required="false" data-desc="The type of product (e.g., 'service', 'good')."></x-field>

  <x-field data-name="prices" data-type="Partial<TPrice>[]" data-required="false" data-desc="An optional array of partial price objects to associate with the product upon creation">
    <x-field data-name="type" data-type="string" data-required="true" data-desc="The type of price (e.g., 'recurring', 'one_time')"></x-field>
    <x-field data-name="unit_amount" data-type="string" data-required="true" data-desc="The price amount as a string"></x-field>
    <x-field data-name="currency_id" data-type="string" data-required="true" data-desc="The currency identifier"></x-field>
    <x-field data-name="recurring" data-type="object" data-required="false" data-desc="Recurring price configuration">
      <x-field data-name="interval" data-type="string" data-required="true" data-desc="The billing interval (e.g., 'month', 'year')"></x-field>
      <x-field data-name="interval_count" data-type="number" data-required="true" data-desc="The number of intervals between each billing"></x-field>
    </x-field>
  </x-field>

  **Returns**

  <x-field data-name="product" data-type="TProductExpanded" data-desc="The newly created product object, including expanded details"></x-field>

  **Example**

  ```javascript
  import payment from '@blocklet/payment-js';

  async function createNewProduct() {
    try {
      const product = await payment.products.create({
        name: 'Premium Service Plan',
        description: 'Access to all premium features and support.',
        type: 'service',
        prices: [
          {
            type: 'recurring',
            unit_amount: '19.99',
            currency_id: 'usd_xxxxxx', // Replace with your currency ID
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
          },
        ],
      });
      console.log('Product created:', product.id);
    } catch (error) {
      console.error('Error creating product:', error.message);
    }
  }

  createNewProduct();
  ```

  **Example Response**
  ```
  {
    "id": xxxx,
    "name": xxxx,
  }
  ```

  This example demonstrates how to create a new product named "Premium Service Plan" with an associated monthly recurring price.

  ## Retrieve a Product

  Use the `retrieve` method to fetch details of a specific product by its ID.

  **Parameters**

  <x-field data-name="id" data-type="string" data-required="true" data-desc="The unique identifier of the product to retrieve."></x-field>

  **Returns**

  <x-field data-name="product" data-type="TProductExpanded" data-desc="The retrieved product object, including expanded details."></x-field>

  **Example**

  ```javascript
  import payment from '@blocklet/payment-js';

  async function getProductDetails(productId) {
    try {
      const product = await payment.products.retrieve(productId);
      console.log('Product details:', product.name, product.description);
    } catch (error) {
      console.error(`Error retrieving product ${productId}:`, error.message);
    }
  }

  getProductDetails('prod_xxx'); // Replace with a valid product ID
  ```

  **Example Response**
  ```
  {
    "id": xxxx,
    "name": xxxx,
  }
  ```

  This example retrieves and logs the details of a product using its ID.

  ## Update a Product

  Use the `update` method to modify an existing product's details.

  **Parameters**

  <x-field data-name="id" data-type="string" data-required="true" data-desc="The unique identifier of the product to update."></x-field>

  <x-field data-name="data" data-type="Partial<TProduct>" data-required="true" data-desc="An object containing the product fields to update. Available fields include name, description, type, etc."></x-field>

  **Returns**

  <x-field data-name="product" data-type="TProductExpanded" data-desc="The updated product object."></x-field>

  **Example**

  ```javascript
  import payment from '@blocklet/payment-js';

  async function updateProductDescription(productId) {
    try {
      const updatedProduct = await payment.products.update(productId, {
        description: 'Updated description for the premium service plan.',
      });
      console.log('Product updated:', updatedProduct.id, updatedProduct.description);
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error.message);
    }
  }

  updateProductDescription('prod_xxx'); // Replace with a valid product ID
  ```

  **Example Response**
  ```
  {
    "id": xxxx,
    "name": xxxx,
  }
  ```

  This example updates the description of an existing product.

  ## List Products

  Use the `list` method to retrieve a paginated list of products. You can filter the results by various criteria.

  **Parameters**

  <x-field data-name="active" data-type="boolean" data-required="false" data-desc="Optional. Filter by product active status."></x-field>

  <x-field data-name="name" data-type="string" data-required="false" data-desc="Optional. Filter by product name."></x-field>

  <x-field data-name="description" data-type="string" data-required="false" data-desc="Optional. Filter by product description."></x-field>

  <x-field data-name="metadata.{key}" data-type="string" data-required="false" data-desc="Optional. Filter by custom metadata fields. Use metadata.yourKey to specify a metadata property."></x-field>

  <x-field data-name="page" data-type="number" data-default="1" data-required="false" data-desc="Optional. The page number for pagination (default: 1)."></x-field>

  <x-field data-name="pageSize" data-type="number" data-default="50" data-required="false" data-desc="Optional. The number of items per page (default: 50)."></x-field>

  <x-field data-name="order" data-type="string" data-required="false" data-desc="Optional. Sort order (e.g., 'created_at:ASC', 'updated_at:DESC')."></x-field>

  <x-field data-name="activeFirst" data-type="boolean" data-required="false" data-desc="Optional. If true, active products are listed first."></x-field>

  **Returns**

  <x-field data-name="data" data-type="TProductExpanded[]" data-desc="An array of product objects."></x-field>

  <x-field data-name="page" data-type="number" data-desc="The current page number."></x-field>

  <x-field data-name="pageSize" data-type="number" data-desc="The number of items per page."></x-field>

  <x-field data-name="total" data-type="number" data-desc="The total number of products matching the criteria."></x-field>

  **Example**

  ```javascript
  import payment from '@blocklet/payment-js';

  async function listActiveProducts() {
    try {
      const products = await payment.products.list({
        active: true,
        pageSize: 10,
        order: 'name:ASC',
      });
      console.log(`Found ${products.total} active products:`);
      products.data.forEach(product => {
        console.log(`- ${product.name} (ID: ${product.id})`);
      });
    } catch (error) {
      console.error('Error listing products:', error.message);
    }
  }

  listActiveProducts();
  ```

  **Example Response**
  ```
  {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "data": [
      {
        "id": xxx,
        "name": xxx,
      }
    ]
  }
  ```

  This example lists the first 10 active products, sorted alphabetically by name.

  ## Search Products

  Use the `search` method to find products based on a general search query. This is useful for free-text searches across product fields.

  **Parameters**

  <x-field data-name="query" data-type="string" data-required="true" data-desc="The search string to match against product fields."></x-field>

  <x-field data-name="page" data-type="number" data-default="1" data-required="false" data-desc="Optional. The page number for pagination (default: 1)."></x-field>

  <x-field data-name="pageSize" data-type="number" data-default="50" data-required="false" data-desc="Optional. The number of items per page (default: 50)."></x-field>

  **Returns**

  <x-field data-name="data" data-type="TProductExpanded[]" data-desc="An array of product objects that match the search query."></x-field>

  <x-field data-name="page" data-type="number" data-desc="The current page number."></x-field>

  <x-field data-name="pageSize" data-type="number" data-desc="The number of items per page."></x-field>

  <x-field data-name="total" data-type="number" data-desc="The total number of products matching the criteria."></x-field>

  **Example**

  ```javascript
  import payment from '@blocklet/payment-js';

  async function searchProducts(searchTerm) {
    try {
      const searchResults = await payment.products.search({
        query: searchTerm,
        pageSize: 5,
      });
      console.log(`Found ${searchResults.total} products matching "${searchTerm}":`);
      searchResults.data.forEach(product => {
        console.log(`- ${product.name} (ID: ${product.id})`);
      });
    } catch (error) {
      console.error(`Error searching for products with "${searchTerm}":`, error.message);
    }
  }

  searchProducts('service');
  ```

  **Example Response**
  ```
  {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "data": [
      {
        "id": xxx,
        "name": xxx,
      }
    ]
  }
  ```

  This example searches for products containing the term "service" and logs the results.

  ## Archive a Product

  Use the `archive` method to set a product's status to archived. Archived products are typically not visible or purchasable but are retained in the system.

  **Parameters**

  <x-field data-name="id" data-type="string" data-required="true" data-desc="The unique identifier of the product to archive."></x-field>

  **Returns**

  <x-field data-name="product" data-type="TProduct" data-desc="The archived product object."></x-field>

  **Example**

  ```javascript
  import payment from '@blocklet/payment-js';

  async function archiveProduct(productId) {
    try {
      const archivedProduct = await payment.products.archive(productId);
      console.log(`Product ${archivedProduct.id} has been archived.`);
    } catch (error) {
      console.error(`Error archiving product ${productId}:`, error.message);
    }
  }

  archiveProduct('prod_xxx'); // Replace with a valid product ID
  ```

  **Example Response**
  ```
  {
    "id": xxxx,
    "name": xxxx,
  }
  ```

  This example archives a specified product.

  ## Delete a Product

  Use the `del` method to permanently delete a product from your PaymentKit system. Use with caution, as this action is irreversible.

  **Parameters**

  <x-field data-name="id" data-type="string" data-required="true" data-desc="The unique identifier of the product to delete."></x-field>

  **Returns**

  <x-field data-name="product" data-type="TProduct" data-desc="The deleted product object."></x-field>

  **Example**

  ```javascript
  import payment from '@blocklet/payment-js';

  async function deleteProduct(productId) {
    try {
      const deletedProduct = await payment.products.del(productId);
      console.log(`Product ${deletedProduct.id} has been permanently deleted.`);
    } catch (error) {
      console.error(`Error deleting product ${productId}:`, error.message);
    }
  }

  deleteProduct('prod_xxx'); // Replace with a valid product ID
  ```

  **Example Response**
  ```
  {
    "id": xxxx,
    "name": xxxx,
  }
  ```

  This example permanently deletes a specified product.

  ## Context Types

  When working with context objects, use `<x-field>` components to describe the structure:

  **UserContext**

  <x-field data-name="user" data-type="object" data-required="true" data-desc="Current user information">
    <x-field data-name="id" data-type="string" data-required="true" data-desc="User unique identifier"></x-field>
    <x-field data-name="name" data-type="string" data-required="true" data-desc="User display name"></x-field>
    <x-field data-name="email" data-type="string" data-required="true" data-desc="User email address"></x-field>
    <x-field data-name="role" data-type="string" data-default="user" data-desc="User role (user, admin, moderator)"></x-field>
  </x-field>

  <x-field data-name="session" data-type="object" data-required="true" data-desc="Current session information">
    <x-field data-name="token" data-type="string" data-required="true" data-desc="Session authentication token"></x-field>
    <x-field data-name="expiresAt" data-type="number" data-required="true" data-desc="Session expiration timestamp"></x-field>
  </x-field>

  <x-field data-name="permissions" data-type="array" data-required="false" data-desc="User permissions list"></x-field>

  ---

  This section covered the essential operations for managing products within PaymentKit. You can now define and organize your offerings. Continue to the [Prices](/core-resources/prices) section to learn how to set up pricing for your products.

</example_item>

<bad_example>
  - 错误示例：
    - A["开始：`blocklet server upgrade`"]
    - A -- "执行命令（例如 `start`、`stop`）" --> B
</bad_example>

<good_example>
  - 正确示例：
    - A["开始：blocklet server upgrade"]
    - A -- "执行命令（例如 start、stop）" --> B
</good_example>
</example>
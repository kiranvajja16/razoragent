import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/products"
      );

      setProducts(response.data);
    } catch (error) {
      console.error(error);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>RazorAgent</h1>
          <p>AI-Powered Agentic Commerce</p>
        </div>

        <div className="status">
          <span></span>
          Backend Connected
        </div>
      </header>

      <main>
        <section className="hero">
          <h2>Product Catalog</h2>
          <p>
            Products available for our AI commerce agent.
          </p>
        </section>

        {loading && (
          <div className="message">
            Loading products...
          </div>
        )}

        {error && (
          <div className="message error">
            {error}
          </div>
        )}

        {!loading && !error && (
          <section className="products">
            {products.map((product) => (
              <div className="product-card" key={product._id}>
                <div className="category">
                  {product.category}
                </div>

                <h3>{product.name}</h3>

                <p className="description">
                  {product.description}
                </p>

                <div className="product-bottom">
                  <strong>₹{product.price}</strong>

                  <span>
                    {product.stock} in stock
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="message">
            No products found.
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
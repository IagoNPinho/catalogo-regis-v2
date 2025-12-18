import { db } from "../firebase-config.js";
import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

class ProductStore {
    products = [];
    loaded = false;

    async load() {
        if (this.loaded) return this.products;
        if (this.loadFromCache()) return this.products;

        const q = query(
            collection(db, "products"),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        this.products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        localStorage.setItem("products", JSON.stringify(this.products));
        this.loaded = true;
        
        return this.products;
    }

    getAll() {
        return this.products;
    }

    getFeatured() {
        return this.products.filter(p => p.featured);
    }

    search(term) {
        return this.products.filter(p =>
            p.name.toLowerCase().includes(term)
        );
    }

    loadFromCache() {
        const data = localStorage.getItem("products");
        if (data) {
            this.products = JSON.parse(data);
            this.loaded = true;
            return true;
        }
        return false;
    }
}




export const productStore = new ProductStore();

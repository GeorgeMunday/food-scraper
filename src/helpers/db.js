import { db } from "../server/firebase.js";

export async function saveProducts(storeName, category, products) {
  if (!products || products.length === 0) {
    console.log(`No products to save for ${storeName} ${category}`);
    return { success: true, count: 0 };
  }

  try {
    const batch = db.batch();
    const timestamp = new Date().toISOString();

    for (const product of products) {
      const docId = `${storeName}_${category}_${product.id}`;
      const docRef = db.collection("products").doc(docId);

      batch.set(docRef, {
        ...product,
        store: storeName,
        category: category,
        scrapedAt: timestamp,
      });
    }

    await batch.commit();
    console.log(
      `✓ Saved ${products.length} ${storeName} ${category} products to Firebase`,
    );

    return { success: true, count: products.length };
  } catch (error) {
    console.error(
      `Error saving ${storeName} ${category} products:`,
      error.message,
    );
    throw error;
  }
}

export async function testDatabaseConnection() {
  try {
    const testRef = db.collection("_connection_test");
    const timestamp = new Date().toISOString();
    await testRef.doc("test").set({
      message: "Connection successful",
      timestamp: timestamp,
    });
    const doc = await testRef.doc("test").get();

    if (doc.exists) {
      const data = doc.data();
      await testRef.doc("test").delete();

      return {
        success: true,
        message: "Database connection successful!",
        data: data,
      };
    } else {
      return {
        success: false,
        message: "Could not verify write operation",
      };
    }
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

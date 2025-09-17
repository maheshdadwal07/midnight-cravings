import { motion } from "framer-motion";

export default function ProductCard({ name, price, img }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-xl border bg-white shadow-sm overflow-hidden"
    >
      <div className="aspect-square bg-gray-100">
        {img ? (
          <img src={img} alt={name} className="w-full h-full object-cover" />
        ) : null}
      </div>
      <div className="p-3">
        <h3 className="font-medium">{name}</h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-red-600 font-semibold">₹{price}</span>
          <button className="text-sm px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700">
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}

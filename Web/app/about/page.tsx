"use client";

import { motion } from "framer-motion";
import { FaHandshake, FaRocket, FaUsers } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

export default function AboutPage() {
  return (
    <>
      <div className="min-h-screen px-4 sm:px-8 md:px-16 lg:px-32 py-12 bg-background text-foreground">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            About <span className="text-primary">BuySell</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            BuySell is a modern marketplace platform where users can buy, sell, and explore a wide variety of products — all in one place.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {/* Mission */}
          <div className="glass p-6 rounded-2xl shadow-lg text-center">
            <FaRocket className="text-primary w-8 h-8 mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
            <p className="text-muted-foreground">
              To empower individuals and businesses to buy and sell safely, easily, and efficiently through an intuitive digital experience.
            </p>
          </div>

          {/* Vision */}
          <div className="glass p-6 rounded-2xl shadow-lg text-center">
            <MdVerified className="text-primary w-8 h-8 mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
            <p className="text-muted-foreground">
              To become the most trusted and accessible digital marketplace in the region, enabling growth and opportunity for all.
            </p>
          </div>

          {/* Community */}
          <div className="glass p-6 rounded-2xl shadow-lg text-center">
            <FaUsers className="text-primary w-8 h-8 mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">Our Community</h3>
            <p className="text-muted-foreground">
              We value transparency, trust, and inclusion — creating a safe and vibrant environment for all our users.
            </p>
          </div>
        </motion.div>

        {/* Core Values */}
        <div className="mt-20 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold mb-6"
          >
            Our Core Values
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {["Integrity", "Innovation", "Customer First", "Accountability", "Simplicity"].map((value, i) => (
              <div
                key={i}
                className="glass px-5 py-3 rounded-xl shadow-md text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                {value}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

    </>
  );
}

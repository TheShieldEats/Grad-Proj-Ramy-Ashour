import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const pricingPlans = [
    {
      level: "Level 1",
      price: "2500 EGP",
      features: [
        "2 individual sessions per week",
        "Individual training only",
        "45-minute sessions",
        "Professional coaching",
      ],
      color: "from-blue-500 to-indigo-600",
    },
    {
      level: "Level 2",
      price: "2800 EGP",
      features: [
        "2 individual sessions per week",
        "Individual training only",
        "45-minute sessions",
        "Professional coaching",
      ],
      color: "from-indigo-500 to-purple-600",
    },
    {
      level: "Level 3",
      price: "4200 EGP",
      features: [
        "3 individual sessions per week",
        "Individual training only",
        "45-minute sessions",
        "Professional coaching",
      ],
      color: "from-purple-500 to-pink-600",
      popular: true,
    },
    {
      level: "Level 4",
      price: "5600 EGP",
      features: [
        "4 individual sessions per week",
        "Individual training only",
        "45-minute sessions",
        "Professional coaching",
      ],
      color: "from-pink-500 to-rose-600",
    },
    {
      level: "Level 5",
      price: "6400 EGP",
      features: [
        "4 individual sessions per week",
        "Individual training only",
        "45-minute sessions",
        "Professional coaching",
      ],
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            PRICING
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Choose Your Training Plan
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the perfect training package to elevate your squash game with
            professional coaching from Ramy Ashour Academy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative group perspective-1000 h-[450px] ${index === 2 ? "lg:col-span-1 md:col-span-2" : ""}`}
            >
              <div className="relative h-full w-full preserve-3d transition-all duration-700 group-hover:rotate-y-180">
                {/* Front of card */}
                <div
                  className={`absolute inset-0 backface-hidden rounded-2xl shadow-xl border border-gray-100 bg-gradient-to-br ${plan.color} text-white p-8 flex flex-col`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full shadow-md transform rotate-12">
                      POPULAR
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-1">{plan.level}</h3>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-sm opacity-80 mb-1">per month</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-center">
                    <span className="text-sm opacity-80">
                      Click to see details
                    </span>
                  </div>
                </div>

                {/* Back of card */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl shadow-xl bg-white p-8 flex flex-col">
                  <h3
                    className={`text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${plan.color}`}
                  >
                    {plan.level} Details
                  </h3>
                  <div className="flex-grow space-y-4">
                    <p className="text-gray-600">
                      Our {plan.level} package is perfect for players looking to
                      improve their skills with professional guidance.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">What's included:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Check className="w-4 h-4 mt-0.5 text-green-600" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        <li className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 mt-0.5 text-green-600" />
                          <span>Video analysis feedback</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 mt-0.5 text-green-600" />
                          <span>Progress tracking</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <Link href="/sign-up" className="mt-6">
                    <Button
                      className={`w-full bg-gradient-to-r ${plan.color} hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300`}
                    >
                      Start Your Training
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Transform Your Game?
          </h2>
          <p className="text-gray-600 mb-6">
            Join Ramy Ashour Academy today and take your squash skills to the
            next level with professional coaching and personalized training.
          </p>
          <Link href="/sign-up">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300 px-8 py-6 text-lg">
              Start Your Training Journey
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

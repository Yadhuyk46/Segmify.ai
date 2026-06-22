def build_recommendations(segment: str, churn_risk: float, loyalty_score: float) -> list[str]:
    recommendations = {
        "Premium Customers": [
            "Launch premium-only bundles with concierge onboarding.",
            "Offer early access to new product drops and VIP service tiers.",
        ],
        "Loyal Customers": [
            "Reward repeat purchases with referral bonuses and loyalty perks.",
            "Promote subscription plans with small annual discounts.",
        ],
        "Budget Customers": [
            "Run value-driven promotions and limited-time coupons.",
            "Bundle complementary products to increase cart value gently.",
        ],
        "At-Risk Customers": [
            "Trigger win-back campaigns with personalized incentives.",
            "Route this segment into proactive support and retention outreach.",
        ],
        "Occasional Buyers": [
            "Use timely reminders and product education to increase purchase frequency.",
            "Recommend best-selling starter packs based on past category interest.",
        ],
    }.get(segment, ["Review purchase patterns and test targeted campaigns."])

    if churn_risk > 0.6:
        recommendations.append("Escalate to churn-prevention automation with special retention offers.")
    if loyalty_score > 75:
        recommendations.append("Invite this customer cohort into advocacy or ambassador programs.")
    return recommendations

import statistics

def detect_outliers(values: list[float]) -> list[float]:
    if not values:
        return []
    q1 = statistics.quantiles(values, n=4)[0]
    q3 = statistics.quantiles(values, n=4)[2]
    iqr = q3 - q1
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    return [v for v in values if v < lower_bound or v > upper_bound]
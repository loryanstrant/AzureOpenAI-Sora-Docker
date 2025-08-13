from app.services.cost import estimate

def test_cost_480_fixed():
    e = estimate("480x480", 10)
    assert round(e.cost_usd, 2) == 1.5
    assert e.min_cost_usd is None and e.max_cost_usd is None

def test_cost_1080x1920_range():
    e = estimate("1080x1920", 10)
    assert e.min_cost_usd == 13.0
    assert e.max_cost_usd == 14.5

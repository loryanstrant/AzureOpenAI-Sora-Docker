import pytest
from pydantic import ValidationError
from app.models.schemas import VideoRequest

def test_1080p_fullhd_cap_at_10s():
    with pytest.raises(ValidationError):
        VideoRequest(prompt="t", resolution="1920x1080", duration_seconds=11)

def test_other_resolutions_allow_20s():
    VideoRequest(prompt="t", resolution="480x480", duration_seconds=20)

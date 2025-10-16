from typing import Dict, Any, List, Optional
import requests
import xml.etree.ElementTree as ET
from backend.config import settings

Session = requests.Session()
Session.auth = (settings.GEOSERVER_USER, settings.GEOSERVER_PASS)

NS_WFS = {
    'wfs': 'http://www.opengis.net/wfs',
    'ows': 'http://www.opengis.net/ows'
}

class GeoServerClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')

    def _get(self, path: str, params: Dict[str, Any]) -> requests.Response:
        url = f"{self.base_url}/{path.lstrip('/')}"
        resp = Session.get(url, params=params, timeout=settings.REQUEST_TIMEOUT_SECONDS)
        resp.raise_for_status()
        return resp

    def list_layers(self) -> List[Dict[str, Any]]:
        # WFS GetCapabilities
        resp = self._get('wfs', {
            'service': 'WFS',
            'version': '1.1.0',
            'request': 'GetCapabilities'
        })
        doc = ET.fromstring(resp.content)
        layers: List[Dict[str, Any]] = []
        for ftype in doc.findall('.//wfs:FeatureType', namespaces=NS_WFS):
            name_el = ftype.find('wfs:Name', namespaces=NS_WFS)
            title_el = ftype.find('wfs:Title', namespaces=NS_WFS)
            bbox_el = ftype.find('ows:WGS84BoundingBox', namespaces=NS_WFS)
            bbox = None
            if bbox_el is not None:
                lower_el = bbox_el.find('ows:LowerCorner', namespaces=NS_WFS)
                upper_el = bbox_el.find('ows:UpperCorner', namespaces=NS_WFS)
                if lower_el is not None and upper_el is not None:
                    lower = lower_el.text.split()
                    upper = upper_el.text.split()
                    bbox = [float(lower[0]), float(lower[1]), float(upper[0]), float(upper[1])]
            layers.append({
                'name': name_el.text if name_el is not None else None,
                'title': title_el.text if title_el is not None else None,
                'bbox': bbox,
            })
        return layers

    def get_feature(self, type_name: str, *, srs: Optional[str] = None,
                    bbox: Optional[str] = None, limit: Optional[int] = None,
                    cql: Optional[str] = None, property_name: Optional[str] = None) -> Dict[str, Any]:
        params = {
            'service': 'WFS',
            'version': '1.1.0',
            'request': 'GetFeature',
            'typeName': type_name,
            'outputFormat': 'application/json',
        }
        if srs:
            params['srsName'] = srs
        if bbox:
            params['bbox'] = bbox
        if limit:
            params['maxFeatures'] = str(limit)
        if cql:
            params['cql_filter'] = cql
        if property_name:
            params['propertyName'] = property_name

        resp = self._get('wfs', params)
        return resp.json()

client = GeoServerClient(settings.GEOSERVER_URL)

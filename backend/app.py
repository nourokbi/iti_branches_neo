import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from config import settings
from services.geoserver import client as geoserver_client


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": settings.ALLOWED_ORIGINS}})

    @app.get('/api/wfs/collections')
    def list_collections():
        layers = geoserver_client.list_layers()
        return jsonify({"collections": layers})

    @app.get('/api/wfs/items')
    def get_items():
        type_name = request.args.get('typeName')
        if not type_name:
            return jsonify({"error": "Missing typeName"}), 400
        srs = request.args.get('srsName', settings.GEOSERVER_DEFAULT_SRS)
        bbox = request.args.get('bbox')
        limit = request.args.get('limit', type=int)
        cql = request.args.get('cql')
        property_name = request.args.get('propertyName')
        try:
            data = geoserver_client.get_feature(
                type_name,
                srs=srs,
                bbox=bbox,
                limit=limit,
                cql=cql,
                property_name=property_name,
            )
            return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return app


app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=settings.PORT, debug=settings.FLASK_ENV == 'development')

from flask import Flask, request, jsonify
from flask_restful import Api, Resource

app = Flask(__name__)
api = Api(app)

# Sample in-memory data
users = []

class User(Resource):
    def get(self):
        return jsonify({'users': users})

    def post(self):
        data = request.get_json()
        users.append(data)
        return jsonify({'message': 'User added successfully', 'user': data})

api.add_resource(User, '/users')

if __name__ == '__main__':
    app.run(debug=True)

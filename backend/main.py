from app import create_app

app = create_app(config_name="production")    #要換模式就來這邊換 本機開發-> development , 記得push的時候要改production

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8080)
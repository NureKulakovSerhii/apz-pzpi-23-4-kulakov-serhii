from locust import HttpUser, task, between

class WarehouseUser(HttpUser):
    wait_time = between(1, 2)
    @task
    def get_warehouses(self):
        self.client.get("/api/Advert/all-adverts")
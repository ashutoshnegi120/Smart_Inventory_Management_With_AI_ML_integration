import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from GenAI import genAI
from vector_database import vector_chroma_put , update_vector_db

def create_app():
    app = FastAPI(
        title="Sales Forecasting & Analytics API",
        version="1.0.0",
        description="Predict sales/orders using SNARIMAX + LLM",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    async def startup_event():
        print("🚀 LLM Forecast API started.")

    @app.on_event("shutdown")
    async def shutdown_event():
        print("❌ Terminating the process...")

    @app.get("/")
    async def root():
        return {"msg": "🧠 LLM Forecast API Running on 🔥"}
    
    @app.put("/genAI/{db_name}")
    async def getDataFromGenAI(db_name: str):
        request_id = uuid.uuid4()
        print(f"[{request_id}] Received request for {db_name}")

        try:
            print(f"[{request_id}] Starting update_vector_db")
            await update_vector_db(db_name=db_name)
            print(f"[{request_id}] Finished update_vector_db")

            print(f"[{request_id}] Starting vector_chroma_put")
            await vector_chroma_put(db_name=db_name)
            print(f"[{request_id}] Finished vector_chroma_put")

            print(f"[{request_id}] Calling genAI()")
            result = await genAI(db_name)
            print(f"[{request_id}] genAI result: {result}")

            if isinstance(result, dict) and "error" in result:
                raise HTTPException(status_code=500, detail=result["error"])

            return {"answer": result}

        except Exception as e:
            print(f"[{request_id}] ERROR: {repr(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    return app
